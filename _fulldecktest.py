# %%
import logging
from skll.block import *
logging.basicConfig(level=logging.DEBUG)
input = Input(name="input", url="file://train.csv")
idsplit = input[0] = XyidSplit(name="idsplit", idcol="Id")
impute_split = idsplit[0] = Split(name="impute", splits=[
    ["PoolQC", "MiscFeature", "Alley", "Fence", 
        "FireplaceQu", "GarageType", "GarageFinish", "GarageQual", 
        "GarageCond", "BsmtQual" , "BsmtCond", "BsmtExposure", 
        "BsmtFinType1", "BsmtFinType2", "MasVnrType", "MSSubClass"],  # NA to "None"
    ["Neighborhood", "LotFrontage"],  # LotFrontage: NA to median() group by "Neighbor"
    ["GarageYrBlt", "GarageArea", "GarageCars", "BsmtFinSF1", 
        "BsmtFinSF2", "BsmtUnfSF", "TotalBsmtSF", "BsmtFullBath",
        "BsmtHalfBath", "MasVnrArea"],  # NA to 0
    ["MSZoning", "Functional", "Electrical", "KitchenQual",
        "Exterior1st", "Exterior2nd", "SaleType"],  # NA to Mode()
    ["SalePrice"],  # np.log1p
    []])
impute_split[1] = ConstantImputer(name="na_to_none", value="None")
impute_split[2] = MethodImputer(name="na_to_median()", method="median", groupby="Neighborhood")
impute_split[3] = ConstantImputer(name="na_to_0", value=0)
impute_split[4] = MethodImputer(name="na_to_mode()", method="mode")
impute_split[5] = Method(name="log1p", method="numpy.log1p", xname=0)
impute_split[6] = Block(name="pass1")
xysplit = impute_split[0] = XyidSplit(name="xysplit", ycol="SalePrice")
deskew_split = xysplit[0] = TypeSplit(name="typesplit", convert_types=False, splits=[
    ["int32", "int64", "float64"],
    []])
deskew_split[1] = ColumnWise(name="columnwise")
deskew_split[1][1] = Method(name="boxcox1p", method="scipy.special.boxcox1p", xname=0, yname=None, args=[None, 0.15])
deskew_split[2] = Block(name="pass2")
encode_split = deskew_split[0] = Split(name="ordinal_split", splits=[
    ['FireplaceQu', 'BsmtQual', 'BsmtCond', 'GarageQual', 'GarageCond', 
    'ExterQual', 'ExterCond','HeatingQC', 'PoolQC', 'KitchenQual', 'BsmtFinType1', 
    'BsmtFinType2', 'Functional', 'Fence', 'BsmtExposure', 'GarageFinish', 'LandSlope',
    'LotShape', 'PavedDrive', 'Street', 'Alley', 'CentralAir', 'MSSubClass', 'OverallCond', 
    'YrSold', 'MoSold'],
    []])
encode_split[1] = SklClass(name="ordinal", cls="sklearn.preprocessing.OrdinalEncoder")
encode_split[2] = Block(name="pass3")
dummy = encode_split[0] = Method(name="dummy", method="pandas.get_dummies", xname=0)
kfold = dummy[0] = SklSplitter(name="kfold", cls="sklearn.model_selection.KFold")
ensembles = kfold[1] = SklWrappingClass(name="ensembles", estname="estimators", cls="sklearn.ensemble.VotingRegressor", train_method="fit+test", multiple=True)
randomforest = ensembles[1] = SklClass(name="randf", cls="sklearn.ensemble.RandomForestRegressor", initkargs={"n_estimators": 100, "random_state": 0})
xgboost = ensembles[2] = SklClass(name="xgboost", cls="xgboost.XGBRegressor", initkargs={"n_estimators": 1000, "learning_rate": 0.05})
lgb = ensembles[3] = SklClass("lightgbm.LGBMRegressor", initkargs={
                            "objective": 'regression',
                            "num_leaves": 5,
                            "learning_rate": 0.05, 
                            "n_estimators": 720,
                            "max_bin": 55, "bagging_fraction": 0.8,
                            "bagging_freq": 5, "feature_fraction": 0.2319,
                            "feature_fraction_seed": 9, "bagging_seed": 9,
                            "min_data_in_leaf": 6, "min_sum_hessian_in_leaf": 11})
e1m = kfold[0] = Method(name="expm1", method="numpy.expm1", xname=0)

# %%
print("Train")
rs = RunSpec()
out = input(rs, None)
# %%
print("Test")
rs.mode = RunSpec.RunMode.TEST
testout = input(rs, None)
# %%
from skll.jsoncodec import JSONEncoder
import json
imported = Block.load(json.loads(json.dumps(input.dump(), cls=JSONEncoder)))
imported.dump() == input.dump()
# %%
rs = RunSpec()
imported.url = "file://train.csv"
out = input(rs, None)

# %%
