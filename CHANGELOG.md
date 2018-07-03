# CHANGELOG

## v1.2.0-rc.1

### FEATURES

- passes an Error constructor which has been modified to include an isControlled = true flag to all config functions/classes that are an instance of Instance
- Methods can now be destructured or named imported without breaking relationship
- number or arguments passed to construct functions is now 4, see readme
- registered dependencies with properties or named exports can be called directly with a dot-separated path, for example, express.Router

### DEVELOPMENT

- semicolons never in eslint rules
- README documentation

## v1.1.0

- initial release
