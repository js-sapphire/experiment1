





const answersDiv = document.querySelector('.answers');
const optionsDiv = document.querySelector('.options');



const isInsideDropZone = (pos) => {
    const dragMeButton = document.querySelector('.dragMe');
    const borders = {
        left: answersDiv.offsetLeft,
        right: answersDiv.offsetLeft + answersDiv.offsetWidth,
        up: answersDiv.offsetTop,
        down: answersDiv.offsetTop + answersDiv.offsetHeight
    }

    const elementPos = {
        left: pos.x,
        right: pos.x + dragMeButton.offsetWidth,
        up: pos.y,
        down: pos.y + dragMeButton.offsetHeight
    }

    return (  elementPos.left > borders.left && elementPos.right < borders.right ) 
         && ( elementPos.up > borders.up && elementPos.down <                        borders.down );
}


const initDragEl = () => {
    const dragMeButtons = document.querySelectorAll('.dragMe');
    const mouseUps = Rx.Observable.fromEvent(document, "mouseup");


    dragMeButtons.forEach((dragMeButton) => {
        const mouseDrags = 
        Rx.Observable.fromEvent(dragMeButton, "mousedown").map(() => {
            return Rx.Observable.fromEvent(document, "mousemove").map((mouseMove) => {
                mouseMove.preventDefault();
                return {
                    x: mouseMove.clientX,
                    y: mouseMove.clientY
                }
            }).takeUntil(Rx.Observable.fromEvent(document, "mouseup"))
        }).concatAll();
    
    
    mouseDrags.forEach(
        (mouseMove) => {
            dragMeButton.style.top = `${mouseMove.y}px`;
            dragMeButton.style.left = `${mouseMove.x}px`;
            if(isInsideDropZone(mouseMove)){
                addBlurFromDropZone();
            } else {
                removeBlurFromDropZone();
            }
        }, 
        () => {},
        () => {})
    
    
    const subscription = mouseUps.forEach(
        () => {
            const buttonPosition = {
                x: dragMeButton.offsetLeft,
                y: dragMeButton.offsetTop
            };
            if(isInsideDropZone(buttonPosition)){
                lockDropZone();
                subscription.dispose();
            }
        }
    )
    })
   
}



const addBlurFromDropZone = () => {
    answersDiv.classList.add('blur');

    if(!answersDiv.querySelector('.dropit')){
        const h1 = document.createElement('h1');
        h1.classList.add('dropit');
        const text = document.createTextNode('Drop it');
        h1.append(text);
        answersDiv.append(h1);
    }
}

const removeBlurFromDropZone = () => {
    answersDiv.classList.remove('blur');
    const dropItElem = answersDiv.querySelector('.dropit') || document.querySelector('.dropit');
    dropItElem && dropItElem.parentElement.removeChild(dropItElem);
}

const lockDropZone = () => {
    const dragMeButton = document.querySelector('.dragMe');
    removeBlurFromDropZone();
    switcher(dragMeButton);
}

const switcher = (button) => {
    if(isPresentInOptions()){
        moveToAnswersFromOptions(button);
    } else {
        moveToOptionsFromAnswers(button);
    }
    initClickEL();
    initDragEl();
}

const initClickEL= () => {
    const dragMeButtons = document.querySelectorAll('.dragMe');
    dragMeButtons.forEach((dragMeButton) => { 
        dragMeButton.addEventListener('click', function handler(){
            dragMeButton.removeEventListener('click', handler);
            switcher(dragMeButton);
        }); 
    });
}


const isPresentInOptions = () => {
    return optionsDiv.querySelector('.dragMe');
}

const moveToAnswersFromOptions = (elem) => {
    const answerElem = elem.cloneNode(true);
    answerElem.style.top = answerElem.style.left =  "inherit";
    elem.parentElement.removeChild(elem);
    answersDiv.appendChild(answerElem);
}

const moveToOptionsFromAnswers = (elem) => {
    const optionElem = elem.cloneNode(true);
    optionElem.style.top = optionElem.style.left =  "inherit";
    elem.parentElement.removeChild(elem);
    optionsDiv.appendChild(optionElem);
}

initClickEL();
initDragEl();