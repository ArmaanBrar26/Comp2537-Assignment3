var isFlipping = false;
var matchedCards = 0;
var totalClicks = 0;
var difficulty = 0;
var totalPairs = 0;
var totalTime = 0;
var startTime = 0;
var timerInterval;



const setup = async () => {
  let firstCard = undefined
  let secondCard = undefined

  $('#difficulty input[type="radio"]').on("click", function () 
  {
    //Remove all actively selected radio buttons
    $('#difficulty label').removeClass("active");

    //Add active class to the selected radio button
    $(this).parent().addClass("active");
  });

  //Get the selected difficulty level
  $("#start").on("click", function () 
  {
    const selectedDifficulty = $("#difficulty input[type='radio']:checked").val();
    console.log(selectedDifficulty);
    if(selectedDifficulty == "easy") {
      difficulty = 3;
      totalPairs = difficulty;
      totalTime = 100;
      var width = 600;
      var height = 400;
    }
    else if(selectedDifficulty == "medium") 
      {
        difficulty = 6;
        totalPairs = difficulty;
        totalTime = 200;
        var width = 800;
        var height = 600;
      }
      else if(selectedDifficulty == "hard")
      {
        difficulty = 12;
        totalPairs = difficulty;
        totalTime = 300;
        var width = 1200;
        var height = 800;
      }
      const gameInfo = document.getElementById("info");
      gameInfo.style.display = "inline";
      const gameContainer = document.getElementById("game_grid");
      gameContainer.style.display = "flex";
      gameContainer.style.width = `${width}px`;
      gameContainer.style.height = `${height}px`;
      const startButton = document.getElementById("start");
      startButton.style.display = "none";
      const themes = document.getElementById("themes");
      themes.style.display = "inline";

      fillHtml(difficulty, totalPairs, totalTime);
      startTimer();
  });

  $("#game_grid").on("click", ".card", function () {

    //Edge case 1: Check if card is double clicked
    if ($(this).hasClass("flip") || $(this).hasClass("matched")) 
    {
      return;
    }

    //Edge case 2: User clicks card while it is flipping
    if (isFlipping) {
      return;
    }

    $(this).toggleClass("flip");

    if (!firstCard)
      firstCard = $(this).find(".front_face")[0]
    else {
      secondCard = $(this).find(".front_face")[0]
      console.log(firstCard, secondCard);
      if (
        firstCard.src
        ==
        secondCard.src
      ) {
        console.log("match")
        $(`#${firstCard.id}`).parent().off("click")
        $(`#${secondCard.id}`).parent().off("click")
        $(`#${firstCard.id}`).parent().addClass("matched")
        $(`#${secondCard.id}`).parent().addClass("matched")
        firstCard = undefined;
        secondCard = undefined;
        setTimeout(() => {
          updateGameInfo();
        }, 1000);
      } else {
        console.log("no match")
        isFlipping = true;
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")
          firstCard = undefined;
          secondCard = undefined;
          isFlipping = false;
          flipAllCards();
        }, 1000)
      }
    }
    totalClicks++;
    $("#num_of_clicks").empty();
    $("#num_of_clicks").append(`<h1>Total Clicks: ${totalClicks}</h1>`);
  });

//Event listener for the theme selection
//Dark theme.
 $("#dark").on("click", function () {
    $("#game_grid").css("background-color", "black");
    $(".card").css("background-color", "black");
  });

//Light theme.
  $("#light").on("click", function () {
    $("#game_grid").css("background-color", "white");
    $(".card").css("background-color", "white");
  });
};

function startTimer() 
{
  startTime = new Date().getTime();

  timerInterval = setInterval(() => {
    var currenttime = new Date().getTime();
    var elapsedTime = Math.floor((currenttime - startTime) / 1000); //Time passed in seconds

    //Update the timer display
    $("#timer").empty();
    $("#timer").append(`<h1> You have ${totalTime} seconds! Time left: ${totalTime - elapsedTime} seconds</h1>`);
  //Check if the time is up
  if(elapsedTime >= totalTime) {
    clearInterval(timerInterval);
    alert("Time is up! You lose!");
    $("#game_grid").empty();
    $("#game_grid").append("<h1><a href='index.html'>Play Again</a></h1>");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

async function fillHtml(difficulty, totalPairs, totalTime) {
   $("#total_pairs").empty();
  $("#total_pairs").append(`<h1>Total Pairs: ${totalPairs}</h1>`);
  $("#num_of_matches").empty();
  $("#num_of_matches").append(`<h1>Number of Matches: ${matchedCards}</h1>`);
  numToWin = totalPairs;
  $("#num_of_pairs").empty();
  $("#num_of_pairs").append(`<h1>Matches remaining: ${numToWin}<h1>`);
  $("#num_of_clicks").empty();
  $("#num_of_clicks").append(`<h1>Total Clicks: ${totalClicks}</h1>`);
  $("#timer").empty();
  $("#timer").append(`<h1>You have ${totalTime} seconds! Time passed: 0s</h1>`);

  $("#game_grid").empty();

  //Array to hold the card images
  var cardImages = [];

  //Loop to add the card images to the array
  for (let i = 1; i <= difficulty; i++) 
  {
    let currentPokemon = [];
    let randomNum = Math.floor(Math.random() * 898) + 1;
    while (currentPokemon.includes(randomNum)) {
      randomNum = Math.floor(Math.random() * 898) + 1;
    }
    currentPokemon.push(randomNum);
    var response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNum}`);
    let data = await response.json();
    for(let j = 0; j < 2; j++)
    {
      cardImages.push(`${data.sprites.other['official-artwork'].front_default}`);
    }
  }

  //Shuffle the card images
  cardImages = shuffle(cardImages);

  //Create card elements with the images
  cardImages.forEach((image, index) => {
    $("#game_grid").append(`
      <div class="card">
        <img id="img${index + 1}" class="front_face" src="${image}" alt="">
        <img class="back_face" src="back.webp" alt="">
      </div>
    `);
  });
}

function updateGameInfo() 
{
  matchedCards++;
  $("#num_of_matches").empty();
  $("#num_of_matches").append(`<h1>Number of Matches: ${matchedCards}</h1>`);
  numToWin--;
  $("#num_of_pairs").empty();
  $("#num_of_pairs").append(`<h1>Matches remaining: ${numToWin}<h1>`);
  setTimeout(() => {
    if (numToWin == 0) {
      stopTimer();
      alert("You win!");
    }
  }, 500);
}

//Function to shuffle an array/cards
function shuffle(array) 
{
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle
  while (currentIndex !== 0) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // Swap it with the current element
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//Function to flip all cards
//This function is used for the powerup feature.
function flipAllCards() 
{
  var unmatchedCards = $(".card:not(.matched)");
  var randomValue = Math.random();
  var powerUpChance = 0.1; // 10% chance to flip all cards

  if(randomValue < powerUpChance) 
    {
      alert("Powerup activated! All cards will be flipped!");
      unmatchedCards.toggleClass("flip");

      setTimeout(() => {
        unmatchedCards.toggleClass("flip");
      }, 1000);
   }
}

$(document).ready(setup)