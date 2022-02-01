# Plugins for Libretto
## Unstable API
***Note: libretto is still in development and plugin API is not stable***

## About plugins
libretto support plugins which:
- connects machine learning packages
- provides extra functions
- automates processes

## Included plugins
- __tabular__
  
  provides access to tabular data via _Pandas_
- __sklearn__
  
  core machine learning toolkit via _Scikit-learn_ and other API-compatible libraries
- __example__
  
  example plugin for demonstration and documentation purpose

## Installing new plugins
Simply copy new plugins into this directory and restart libretto
### Disabling plugin
Create a section named with fqdn of the plugin and set disabled to yes, e.g.
```ini
[libretto.plugin.example]
  disabled = yes
```

## Development new plugin
see [README.md](example/README.md) in example