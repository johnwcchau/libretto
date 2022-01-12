### sk-learn Plugin

This is the core plugin to support sk-learn transformer classes and methods, 
as well as other sk-learn compatible common library, extensions to other sk-learn compatible library is easy and can be done in minutes.

**Libraries already supported**
- sk-learn (obivously)
- hdbscan
- lightgbm
- xgboost
- giotto-tda

## To add package support
A definititon file needs to be generated, ses _enum.py for some references, additionally 
modify `VALID_PACKAGES` const in \_\_init\_\_.py to let this plugin to enumerate the package.