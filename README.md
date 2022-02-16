![Logo Here](/client/img/libretto.svg)
# Libretto
A drag-and-drop visual designer for data analysis and machine learning. The goal of this project is to create an environment for non-programmers to focus on data rathar than coding and debugging.

## Features
- Intergrated with well-known Scikit-learn framework, and supports related libraries
- Drag-and-drop editor, top-to-bottom straight-forward pipeline
- Can be use from beginner works to business-critical ML models
- Platform independent web interface, supports cloud deployment
- Export model in runtime mode for on-line prediction
- Support plugins for more sophisticated machine learning algorithm

## Installation
- clone this repo 
- `pip install -r requirements.txt`
- depending on your requirements, install also the following machine learning packages
  - scikit-learn
  - giotto-tda
  - xgboost
  - lightgbm
  - hdbscan
- `python main.py`

## Getting started
Examples are provided, launch Libretto, browse to example folder, drag-and-drop the _json_ file to the center panel _(or right-click -> load as receipe)_

## Vision
Libretto aims at _One-liner is a bare-pass, coding is fail_, if user has to code for the machine learning model to function then it should be built as a receipe block which can be drag-and-drop in the editor instead. While Libretto does not aim at mobile ML development, one should be able to create a ML model on their smartphone with their finger tips.

## Expected features to be implemented
- Keras / Pytorch intergration
- Non-tabular data support
- Pre-built macro blocks for one-click machine learning model
- One click model deployment

## Plugin related
See [README.md](libretto/plugin/README.md) in libretto/plugin directory