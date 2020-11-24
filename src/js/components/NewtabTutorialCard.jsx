import React, { useState } from 'react';
import DataStore from '../base/plumbing/DataStore';

const tutorialPath = ['widget', 'TutorialCard'];
const tutorialOpenPath = [...tutorialPath, 'open'];

const NewtabTutorialCard = () => {

    const open = DataStore.getValue(tutorialOpenPath);

    return open && <div className="tutorial-card bg-white position-absolute" style={{top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:100, height: 100}}>

    </div>;
};

const openTutorial = () => {
    DataStore.setValue(tutorialOpenPath, true);
};

export { openTutorial };
export default NewtabTutorialCard;
