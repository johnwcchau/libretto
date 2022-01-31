# Libretto
A drag-and-drop pipeline designer for data analysis and machine learning. The goal of this project is to create an environment for non-programmers to focus on data rathar than coding and debugging.

## Vision
Libretto aims at _One-liner is a bare-pass, coding is fail_, if user has to code for the machine learning model to function then it should be built as a receipe block which can be drag-and-drop in the editor instead. While Libretto does not aim at mobile ML development, one should be able to create a ML model on their smartphone with their finger tips.

## Features
- Intergrated with well-known Scikit-learn framework, and supports related libraries
- Easy to use drag-and-drop editor, top-to-bottom straight-forward pipeline
- Platform independent web interface, supports cloud deployment
- Support plugins for more sophisticated machine learning algorithm

## Expected features to be implemented
- Keras / Pytorch intergration
- Non-tabular data support
- Pre-built macro blocks for one-click machine learning model
- One click model deployment

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

## Plugin related
See [README.md](libretto/plugin/README.md) in libretto/plugin directory