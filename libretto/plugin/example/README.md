# Developing new plugin
_This example plugin contains most basic know-how on creating a new plugin, and is a good template for a good start_

There are two parts for plugin, server-side and client-side.

## Server-side
### Initalization
- At start-up, Libretto will look for every directory in libretto/plugin for `__init__.py`, which acts as entry point for the server-side part of the plugin, and calls `__init_plugin()` should it exists for initialization (it is **OK** for `__init_plugin()` to not exists and plugin will still load)

- As new editor session connects (or, in runtime mode, the instance is created), `__new_session()` is called in `__init__.py` with a unique session name as indentifier for the session.

- As user finish and quits, `__destroy_session()` will be called as destructor call.

  _**Note:** In current version no session will be destroyed and so `__destroy_session()` will not be called, despite this, developers should implement `__destroy_session()` as it will be called for future versions_

### Receipe blocks
- When "cooking" receipe, client-side passes a json file _(see /storage/example for examples)_, nd Libretto will dynamically import the class as specified in _pytype field, so there is actually no requirement on where should the class be located or loaded, as long as the class name matches.

- All block should extends Blocks in libretto.baseblock module, and overrides `__init__()` for initialization, all arguments in `__init__()` must have default values and `super().__init__()` must be called.

  _**Hint:** There are also Parent and Loop superclass which provides basic parts for subclassing_

- Every block should be "state-less", When user made changes to the parameter of the block, a block is destroyed and re-created and no data will be carried forward

- All block should overrides `run()` for data processing 
  
  _or in case of Loop type, loop() should be overrided instead and yields/returns a Generator for looping_
  
  **It is not recommanded to override `__call__()` directly**

### Remote API Calls from client
- Remote API calls are used in editors only for interactive actions.
- All methods are global and static, and all calls are async
- Client calls method by `module name::function_name`, e.g. `libretto.plugin.example::my_function`
- There is no limitation on both function and module naming, as long as Libretto can dynamically load the function, it will get called.
- Alongside client-side arguments, `session` and `writer` will be included in argument list
  - **session** is the client session identifier passed during `__new_session()` call
  - **writer** is a helper object for writing responses to client side

## Client side
### Initalization
- At start-up, Libretto will scans, in each plugin directory, for a module file `__init__.mjs`, which acts as entry point for Editor part of the plugin, and imports it into the __auto-generated__ `plugins.mjs` for loading, developers should therefore import all their seperate modules in their own `__init__.mjs`.
- jQuery is included globally as a script in the main html header instead of a module
- a jQuery event `plugin.load` will be raised after core script load, plugin can catch this event with `$(document).on("plugin.load", HANDLER_HERE);`.

### Receipe blocks
- all receipe blocks has a **javascript class** and alongside a **block definition**
- most responsibilty of the **javascript class** is to handle UI interaction, while **block definition** mostly defines block's server-side specifics for receipe generation and running

  _**TODO** some parts do break this rule and needs re-thinking_
- `Block` class in `BaseBlock.mjs` is the superclass of all receipe blocks and handles every UI interactions, while `Parent` class extends `Block` with folder/grouping functions
- `BlockTypes` class in `BaseBlock.mjs`is the singleton class of Blocks' definition library, all receipe block definition must be registered there in order to be usable, registration could be done as 

  ```javascript
  import {BlockTypes} from "/static/modules/BaseBlock.mjs"
  new BlockTypes().add({
      //Definitions Here
  })
  ```
- _**TODO** More definition's explanation_

### Remote API Calls to server
- Remote calls can be made to server-side with session's web-socket
- Suppose making a call to my_plugin.my_function(my_argument:str):
  
  ```javascript
  import getCurrentSession from '/static/modules/Session.mjs';
  getCurrentSession().WsClient
    .send("libretto.plugin.my_plugin::my_function", {my_argument: "Argument value"})
    .then(response => {
        // do something to response, which is a nullable JSON object
    }).catch(error => {
        // handle error here, 
        // note: error can be a Javascript error object
        //       or a JSON object in case a server runtime error 
    });
  ```