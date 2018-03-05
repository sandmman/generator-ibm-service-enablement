//https://github.com/yeoman/yeoman-assert

'use strict';
const path = require('path');
const yassert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fs = require('fs');

const GENERATOR_PATH = '../generators/app/index.js';
const SERVER_MAPPINGS_JSON = "config/mappings.json";
const SERVER_LOCALDEV_CONFIG_JSON = "config/localdev-config.json";

describe('swift-kitura', function () {
	this.timeout(10 * 1000); // 10 seconds, Travis CI might be slow

	describe('all services', function () {
		const optionsBluemix = JSON.parse(fs.readFileSync(require.resolve('./resources/bluemix.json')));
		const codeForServices = [];
		const dependencies = [];
		const modules = [];
		let runContext;

		before(() => {
			optionsBluemix.backendPlatform = "SWIFT";
			runContext = helpers
				.run(path.join(__dirname, GENERATOR_PATH))
				.withOptions({
					bluemix: JSON.stringify(optionsBluemix),
					parentContext: {
						injectIntoApplication: function (options) {
							codeForServices.push(options.service);
						},
						injectDependency: function (dependency) {
							dependencies.push(dependency);
						},
						injectModules: function (module) {
							modules.push(module);
						}
					}
				});
			return runContext.toPromise();
		});

		after(() => {
			runContext.cleanTestDirectory();
		});

		it('Can run successful generation and create files', () => {
			// Composing generator is responsible for writing
			// Application.swift and Package.swift. Here we can test
			// that the local subgenerators are correctly injecting
			// the dependencies and instrumentation to the composing
			// generator.
			yassert(codeForServices.length > 0, "expected instrumentation");
			yassert(dependencies.length > 0, "expected dependencies");

			yassert.file('.gitignore');
			yassert.file('config');
			yassert.file(SERVER_MAPPINGS_JSON);
			yassert.file('Sources/Application/Services');
			yassert.file(SERVER_LOCALDEV_CONFIG_JSON);
			yassert.fileContent('.gitignore', SERVER_LOCALDEV_CONFIG_JSON);
		});

		it('Can add Auth/AppID instrumentation', () => {
			testAll('service-auth', 'auth', optionsBluemix.auth.serviceInfo.name, {
				[optionsBluemix.auth.serviceInfo.name]: {
					tenantId: optionsBluemix.auth.tenantId,
					clientId: optionsBluemix.auth.clientId,
					secret: optionsBluemix.auth.secret,
					oauthServerUrl: optionsBluemix.auth.oauthServerUrl,
					profilesUrl: optionsBluemix.auth.profilesUrl
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Cloudant instrumentation', () => {
			testAll('service-cloudant', 'cloudant', optionsBluemix.cloudant[0].serviceInfo.name, {
				[optionsBluemix.cloudant[0].serviceInfo.name]: {
					username: optionsBluemix.cloudant[0].username,
					password: optionsBluemix.cloudant[0].password,
					url: optionsBluemix.cloudant[0].url
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Object Storage instrumentation', () => {
			testAll('service-objectStorage', 'objectStorage', optionsBluemix.objectStorage[0].serviceInfo.name, {
				[optionsBluemix.objectStorage[0].serviceInfo.name]: {
					projectId: optionsBluemix.objectStorage[0].projectId,
					userId: optionsBluemix.objectStorage[0].userId,
					password: optionsBluemix.objectStorage[0].password,
					region: optionsBluemix.objectStorage[0].region
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Redis instrumentation', () => {
			testAll('service-redis', 'redis', optionsBluemix.redis.serviceInfo.name, {
				[optionsBluemix.redis.serviceInfo.name]: {
					uri: optionsBluemix.redis.uri
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add MongoDB instrumentation', () => {
			testAll('service-mongodb', 'mongodb', optionsBluemix.mongodb.serviceInfo.name, {
				[optionsBluemix.mongodb.serviceInfo.name]: {
					uri: optionsBluemix.mongodb.uri
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Conversation instrumentation', () => {
			testAll('service-conversation', 'conversation', optionsBluemix.conversation.serviceInfo.name, {
				[optionsBluemix.conversation.serviceInfo.name]: {
					username: optionsBluemix.conversation.username,
					password: optionsBluemix.conversation.password,
					url: optionsBluemix.conversation.url
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Push Notifications instrumentation', () => {
			testAll('service-push', 'push', optionsBluemix.push.serviceInfo.name, {
				[optionsBluemix.push.serviceInfo.name]: {
					appGuid: optionsBluemix.push.appGuid,
					appSecret: optionsBluemix.push.appSecret,
					clientSecret: optionsBluemix.push.clientSecret,
					url: optionsBluemix.push.url
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add Alert Notification instrumentation', () => {
			testAll('service-alertNotification', 'alertNotification', optionsBluemix.alertNotification.serviceInfo.name, {
				[optionsBluemix.alertNotification.serviceInfo.name]: {
					name: optionsBluemix.alertNotification.name,
					password: optionsBluemix.alertNotification.password,
					url: optionsBluemix.alertNotification.url
				}
			}, dependencies, modules, codeForServices);
		});

		it('Can add PostgreSQL instrumentation', () => {
			testAll('service-postgresql', 'postgresql', optionsBluemix.postgresql.serviceInfo.name, {
				[optionsBluemix.postgresql.serviceInfo.name]: {
					uri: optionsBluemix.postgresql.uri
				}
			}, dependencies, modules, codeForServices);
		});
	});

	describe('no services', function () {
		const optionsBluemix = JSON.parse(fs.readFileSync(require.resolve('./resources/bluemix.json')));
		const codeForServices = [];
		const dependencies = [];
		const modules = [];
		let runContext;

		before(() => {
			optionsBluemix.backendPlatform = "SWIFT";
			for (let key in optionsBluemix) {
				if (key !== 'name' && key !== 'backendPlatform' && key !== 'server') {
					delete optionsBluemix[key];
				}
			}
			runContext = helpers
				.run(path.join(__dirname, GENERATOR_PATH))
				.withOptions({
					bluemix: JSON.stringify(optionsBluemix),
					parentContext: {
						injectIntoApplication: function (options) {
							codeForServices.push(options.service);
						},
						injectDependency: function (dependency) {
							dependencies.push(dependency);
						},
						injectModules: function (module) {
							modules.push(module);
						}
					}
				})
			return runContext.toPromise();
		});

		after(() => {
			runContext.cleanTestDirectory();
		});

		it('Can run successful generation', () => {
			yassert.equal(0, dependencies.length, "expected no injected dependencies");
			yassert.noFile(SERVER_LOCALDEV_CONFIG_JSON);
		});
	})

	describe('push notifications with non-default region', function () {
		const sdkRegions = {
			'ng.bluemix.net': 'US_SOUTH',
			'eu-gb.bluemix.net': 'UK',
			'au-syd.bluemix.net': 'SYDNEY'
		};
		const regionsToTest = Object.keys(sdkRegions);
		regionsToTest.forEach(region => {
			describe(region, function () {
				const optionsBluemix = JSON.parse(fs.readFileSync(require.resolve('./resources/bluemix.json')));
				const codeForServices = [];
				const dependencies = [];
				const modules = [];
				let runContext;

				before(() => {
					optionsBluemix.backendPlatform = "SWIFT";
					optionsBluemix.push.url = "http://imfpush." + region
					runContext = helpers
						.run(path.join(__dirname, GENERATOR_PATH))
						.withOptions({
							bluemix: JSON.stringify(optionsBluemix),
							parentContext: {
								injectIntoApplication: function (options) {
									codeForServices.push(options.service);
								},
								injectDependency: function (dependency) {
									dependencies.push(dependency);
								},
								injectModules: function (module) {
									modules.push(module);
								}
							}
						})
					return runContext.toPromise();
				});

				it('Can add Push Notifications instrumentation', () => {
					testAll('service-push', 'push', optionsBluemix.push.serviceInfo.name, {
						[optionsBluemix.push.serviceInfo.name]: {
							appGuid: optionsBluemix.push.appGuid,
							appSecret: optionsBluemix.push.appSecret,
							clientSecret: optionsBluemix.push.clientSecret,
							url: ("http://imfpush." + region)
						}
					}, dependencies, modules, codeForServices);
				});
			})
		})
	})
});

function testAll(serviceName, servLookupKey, servInstanceName, localDevConfigJson, dependencies, modules, codeForServices) {
	testServiceDependencies(serviceName, dependencies);
	testServiceInstrumentation(serviceName, servLookupKey, codeForServices);
	testServiceModules(serviceName, modules);
	testMappings(servLookupKey, servInstanceName);
	testLocalDevConfig(localDevConfigJson || {});
}

function testServiceDependencies(serviceName, dependencies) {
	const filePath = path.join(__dirname, "..", "generators", serviceName, "templates", "swift", "dependencies.txt");
	const fileContent = fs.readFileSync(filePath, 'utf8');
	fileContent.split('\n').map(line => line.trim()).filter(line => !!line).forEach(dep => {
		yassert(dependencies.indexOf(dep) !== -1, 'expected dependency ' + dep);
	});
}

function testServiceModules(serviceName, modules) {
	let serviceVariable = {
		"service-alertNotification": "AlertNotifications",
		"service-auth": "BluemixAppID",
		"service-autoscaling": "",
		"service-cloudant": "CouchDB",
		"service-objectStorage": "BluemixObjectStorage",
		"service-redis": "SwiftRedis",
		"service-mongodb": "MongoKitten",
		"service-postgresql": "SwiftKueryPostgreSQL",
		"service-push": "BluemixPushNotifications",
		"service-conversation": "WatsonDeveloperCloud"
	};
	const module = "\"" + `${serviceVariable[serviceName]}` + "\"";
	yassert(modules.indexOf(module) !== -1, 'expected module ' + module);
}

function testServiceInstrumentation(serviceName, servLookupKey, codeForServices) {

	/**
	 * Map between scaffolder keys and legacy service keys
	 * @type {{auth: string, conversation: string, alertNotification: string, cloudant: string, mongodb: string, objectStorage: string, postgresql: string, push: string, redis: string}}
	 */
	let serviceLookupMap = {
		"auth": "appid",
		"conversation": "watson_conversation",
		"alertNotification": "alert_notification",
		"cloudant": "cloudant",
		"mongodb": "mongodb",
		"objectStorage": "object_storage",
		"postgresql": "postgre",
		"push": "push",
		"redis": "redis"
	};


	let serviceVariable = {
		"service-alertNotification": "alertNotificationService",
		"service-auth": "appidService",
		"service-cloudant": "couchDBService",
		"service-objectStorage": "objectStorageService",
		"service-redis": "redisService",
		"service-mongodb": "mongoDBService",
		"service-postgresql": "postgreSQLService",
		"service-push": "pushNotificationService",
		"service-conversation": "watsonConversationService"
	};

	function pascalize(name) {
		if (name.indexOf('-') > -1) {
			name = name.substring(0, name.indexOf('-')) + name[name.indexOf('-') + 1].toUpperCase() + name.substring(name.indexOf('-') + 2);
		}
		return name[0].toUpperCase() + name.substring(1); //return name.split('-').map(part => part.charAt(0).toUpperCase() + part.substring(1).toLowerCase()).join('');
	}

	let expectedInitFunctionDeclaration = `initializeService${pascalize(servLookupKey)}(cloudEnv: cloudEnv)`;
	let expectedInitFunctionTemplate = `initializeService${pascalize(servLookupKey)}(cloudEnv: CloudEnv)`;

	yassert(codeForServices.indexOf(`${serviceVariable[serviceName]} = try ${expectedInitFunctionDeclaration}`) !== -1);

	yassert.fileContent(`Sources/Application/Services/Service${pascalize(servLookupKey)}.swift`, `name: "${serviceLookupMap[servLookupKey]}"`);
	yassert.fileContent(`Sources/Application/Services/Service${pascalize(servLookupKey)}.swift`, `func ${expectedInitFunctionTemplate}`);

}

function testMappings(servLookupKey, servInstanceName) {
	/**
	 * Map between scaffolder keys and legacy service keys
	 * @type {{auth: string, conversation: string, alertNotification: string, cloudant: string, mongodb: string, objectStorage: string, postgresql: string, push: string, redis: string}}
	 */
	let serviceLookupMap = {
		"auth": "appid",
		"conversation": "watson_conversation",
		"alertNotification": "alert_notification",
		"cloudant": "cloudant",
		"mongodb": "mongodb",
		"objectStorage": "object_storage",
		"postgresql": "postgre",
		"push": "push",
		"redis": "redis"
	};

	const envVariableName = servInstanceName.replace(/-/g, "_");
	const expectedMappings = {
		[serviceLookupMap[servLookupKey]]: {
			credentials: {
				searchPatterns: [
					"cloudfoundry:" + servInstanceName,
					"env:" + envVariableName,
					"file:/config/localdev-config.json:" + servInstanceName
				]
			}
		}
	};

	yassert.jsonFileContent(SERVER_MAPPINGS_JSON, expectedMappings);
}

function testLocalDevConfig(json) {
	yassert.jsonFileContent(SERVER_LOCALDEV_CONFIG_JSON, json);
}
