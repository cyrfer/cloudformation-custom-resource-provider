const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const nock = require('nock');
const { drillDown } = require('deepdown');

const sinon = require('sinon');
const mocker = require('sinon-mocker');
const assert = require('chai').assert;

const errorTypes = {
    LOAD: "LOAD",
    VALIDATION: "VALIDATION",
};

const makeError = (error, what) => {
    return { error, what, };
};

const loadAppSchema = {"type": "object", "required": ["path"], "properties": {"path": {"type": "string"}, "key": {"type": "string"}}};
const loadInputSchema = {"type": "object", "required": [], "properties": {"file": {"type": "string"}}};
const loadAllInputsSchema = {"type": "array", "items": loadInputSchema};

const compile = (schema) => {
    return (new Ajv({allErrors: true})).compile(schema);
};
const validateLoadApp = compile(loadAppSchema);
const validateAllInputs = compile(loadAllInputsSchema);

const getMockKey = (mock) => {
    const key = [
        mock.moduleName,
        mock.className ? mock.className : mock.method
    ].join('/');
    return key;
};

const setupNock = (m) => {
    m.nockScope = nock(new RegExp(m.hostname))
    m.nockScope[m.httpMethod](new RegExp(m.path)).reply(m.httpResponseStatusCode, m.httpResponseBody);
};

const applyTestMocks = (mocks, liveMocks) => {
    mocks.forEach((m) => {
        if (m.httpMethod) {
            return setupNock(m);
        }
        const {resultArgs, resultMethod} = m;
        const key = getMockKey(m);
        liveMocks[key] && liveMocks[key][resultMethod] &&
        liveMocks[key][resultMethod](...resultArgs);
    });
};

const resetMocks = (mocks) => {
    Object.keys(mocks).forEach(m => m.reset());
};

const restoreServiceStubs = (stubs) => {
    Object.keys(stubs).forEach(k => stubs[k].restore());
};

const setupServiceStubs = (theMocks, stubs) => {
    const mocksPerModulePerClassName = theMocks
        .filter(m => m.className)
        .reduce((accum, m) => {
            const indexStr = getMockKey(m);
            accum[indexStr] = {
                ...accum[indexStr],
                [m.method]: m.mock
            };
            return accum;
        }, {});

    theMocks.forEach(m => {
        if (!m.moduleName) {
            return;
        }
        const indexStr = getMockKey(m);
        if (stubs[indexStr]) {
            return;
        }
        const mod = require(m.moduleName);
        let aStub;
        if (m.className) {
            const mock = mocksPerModulePerClassName[indexStr];
            aStub = sinon.stub(mod, m.className).callsFake(mocker.fakeCtor(mock));
        } else {
            aStub = sinon.stub(mod, m.method);
            m.mock = aStub;
        }
        stubs[indexStr] = aStub;
    });
};

const setupSpies = (expects, spies) => {
    (expects || []).forEach(expectation => {
        if (expectation.spyKey) {
            const mod = require(expectation.moduleName);
            const aSpy = sinon.spy(mod, expectation.method);
            expectation.spy = aSpy;
            spies.push(aSpy);
        }
    })
};

const releaseSpies = (expects, spies) => {
    spies.forEach(spy => {
        spy.restore();
    });
    (expects || []).forEach(expectation => {
        if (expectation.spy) {
            expectation.spy = null;
        }
    });
}

const checkAssert = (expectation, output, liveMocks) => {
    if (expectation.spyKey) {
        const spiedValue = drillDown(expectation.spy, expectation.spyKey);
        const args = [spiedValue];
        if (expectation.value) {
            args.push(expectation.value);
        }
        assert[expectation.compare](...args);
    }
};

const checkExpectations = (expects, liveMocks, output) => {
    (expects || []).forEach(expectation => {
        checkAssert(expectation, output, liveMocks);
    });
};

const runApp = async (app, args) => {
    return app(...args);
};

exports.testSetup = ({app, test}, mocha={
    before: before,
    after: after,
    afterEach: afterEach,
    it: it,
}) => () => {
    const serviceStubs = {};
    const liveMocks = {};
    mocha.before(() => {
        if (test.networkEnabled) {
            nock.enableNetConnect();
        } else {
            nock.disableNetConnect();
        }
        // TODO: determine serviceStubs from mocks
        setupServiceStubs(test.mocks, serviceStubs, liveMocks);
    });
    mocha.after(() => {
        // TODO: restore all serviceStubs
        restoreServiceStubs(serviceStubs);
    });
    mocha.afterEach(() => {
        resetMocks(liveMocks);
    });
    const execTest = ({name, mocks, args, expects}) => {
        const spies = [];
        setupSpies(expects, spies);
        applyTestMocks(mocks, liveMocks);
        mocha.it(name, () => {
            return runApp(app, args).then(output => {
                checkExpectations(expects, liveMocks, output);
                releaseSpies(expects, spies);
            });
        });
    };
    execTest(test);
};

exports.loadInput = (inputs, relativeDir=__dirname) => {
    if (!validateAllInputs(inputs)) {
        return new Error(makeError(errorTypes.VALIDATION, validateAllInputs.errors))
    }
    return inputs.map(input => {
        const { __filepath, __parse=true } = input;
        if (!__filepath) {
            return input;
        }
        const dataPath = path.resolve(relativeDir, __filepath);
        const data = fs.readFileSync(dataPath);
        if (__parse) {
            try {
                const parsed = JSON.parse(data);
                return parsed;
            } catch (e) {
                console.warn(`failed to JSON.parse [${__filepath}] with error: ${JSON.stringify(e)}`);
            }
        }
        return data;
    });
};

exports.loadApp = (data) => {
    if (!validateLoadApp(data)) {
        throw new Error(makeError(errorTypes.VALIDATION, validateLoadApp.errors));
    }
    const mod = require(data.path);
    if (data.key) {
        return mod[data.key];
    }
    return mod;
};
