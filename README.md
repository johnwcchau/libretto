![Logo Here](/client/img/libretto.svg)
# Libretto
A drag-and-drop visual designer for data analysis and machine learning, using popular Scikit-learn and other related packages. The goal of this project is to create an environment for non-programmers to easily create baseline models, focus on data rathar than coding and debugging.

## Features
- Intergrated with well-known Scikit-learn framework, and supports related libraries
- Drag-and-drop editor, top-to-bottom straight-forward pipeline
- Can be use from beginner works to business-critical ML models
- Platform independent web interface, supports cloud deployment
- Export model in runtime mode for on-line prediction
- Support plugins for more sophisticated machine learning algorithm

## Installation
### Docker route
Use [Dockerfile](docker/editor/Dockerfile) to build and run docker image
```bash
#build docker image
docker build -t libretto/editor .
#start docker container
docker run -p 6789:6789 -d --name libretto-editor libretto/editor
```
**NOTE:** First run takes time because required packages are being installed in first run, to check installation progress, simply attach to docker container with:
```bash
docker attach libretto-editor
```

Connect to libretto editor with any browser to http://localhost:6789

### Bare metal route
#### Prerequists
- Python 3
    
    _Libretto is developed with **Python 3.9**, other versions may work_

#### Steps
1. clone/download this repo 
2. `python main.py`
    
    Main script will automatically create a virtual environment and install required packages at first run.

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