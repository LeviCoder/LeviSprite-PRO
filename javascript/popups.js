
/**

this script contains functions to create and display HTML popups for various purposes

**/

var popupEl, popperEl, popupCodes, popupOpen = false, popupCurr, popButtons, popCheck, popAnswer, popError, popInp;

function popupSetup() {
  popupEl = document.getElementById("popup");
  popperEl = document.getElementById("popper");
  popButtons = {
    "close": document.getElementById("pop-close"),
    "cancel": document.getElementById("pop-cancel"),
    "enter": document.getElementById("pop-enter"),
  };
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
  for(var i in popButtons) {
    popButtons[i].style.display = "none";
  }
  popupOpen = false;
}
function enterPopup() {
  if(popCheck(popAnswer.value)) {
    closePopup();
  } else {
    // popError
    popError.style.display = "block";
  }
}

var popupListener = {
  "enter palette": null,
};


function createPopup(pop, inp) {

  popupEl.style.display = "flex";
  popperEl.innerHTML = popupCodes[pop][0](inp);

  for (var i = 0; i < popupCodes[pop][1].length; i++) {
    popButtons[popupCodes[pop][1][i]].style.display = "block";
  }

  popCheck = popupCodes[pop][2];
  popAnswer = document.getElementById('pop-answer');
  popError = document.getElementById('pop-error');
  popupOpen = true;
  popupCurr = pop;
  popInp = inp;
}
