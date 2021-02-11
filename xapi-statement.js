//Allows access to LRS
const conf = {
    "endpoint": "https://example.lrs",
    "auth": "Basic " + toBase64("username:password")
  };
ADL.XAPIWrapper.changeConfig(conf);


//Ensures entered name can be accepted by LRS

 function checkUserName() {
  const list = RegExp(/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\"_:<>\?]/); //Unacceptable characters
  const player = GetPlayer(); //Creates StoryLine conenction
  const goodNamejs = player.GetVar("userName"); //Gets eneterd name from StoryLine

  if (list.test(goodNamejs)) {
    player.SetVar("specialCharacter", true); //Tells sToryLine to have user re-enter name
    } else {
      player.SetVar("specialCharacter", false); //Allows user to proceed
    };
};



//Gathers and sends user information to LRS

function sendStatement(verb, verbId, object, objectId, openTextVar) { //sendStatement("passed", "http://adlnet.gov/expapi/verbs/passed", "quiz", "http://example.com/xapi-sample-quiz", "userAvatar")
  const player = GetPlayer(); //Creates connection to JS file
  const uNamejs = player.GetVar("userName"); //Retrieves userName value from StoryLine
  const userResponse = player.GetVar(openTextVar);//Retrieves userAvatar value from StoryLine
  const rawScorejs = player.GetVar("rawScore"); //Retrieves travelScore value from StoryLine
  const maxScorejs = player.GetVar("maxScore"); //Retreives maxScore value from StoryLine
  const emailNamejs = uNamejs.replaceAll(" ",""); //Ensures actor mbox value is valid
  const statement = {

    "actor": {
      "name": uNamejs,
      "mbox": "mailto:" + emailNamejs +"@email.com"
    },
    "verb": {
      "id": verbId,
      "display": { "en-us": verb }
    },
    "object": {
      "id": objectId,
      "definition": {
        "name": { "en-us": object }
      }
    },
    "result": {
      "response": userResponse,
      "score": {
        "min": 0,
        "max": maxScorejs,
        "raw": rawScorejs
      }
    }
  };
  const result = ADL.XAPIWrapper.sendStatement(statement);
};


//Queries LRS based on userName input. Pulls stored information and populates within StoryLine.
function populateLeaderboard() {
  const parameters = ADL.XAPIWrapper.searchParams();
  parameters["verb"] = "http://adlnet.gov/expapi/verbs/passed";
  parameters["activity"] = "http://example.com/xapi-sample-quiz";
  const queryData = ADL.XAPIWrapper.getStatements(parameters);

//
  let statements = queryData.statements;
  statements.sort(function(a, b) {
    return b.result.score.raw-a.result.score.raw;
  })

//
  for (let i = 0; i < statements.length; i++) {
    statements[i].result.score.raw = statements[i].result.score.raw * 100;
  }

  const player = GetPlayer();

  //Sets the names of the top 5 of the leaderboard
  player.SetVar("firstUser", statements[0].actor.name);
  player.SetVar("secondUser", statements[1].actor.name);
  player.SetVar("thirdUser", statements[2].actor.name);
  player.SetVar("fourthUser", statements[3].actor.name);
  player.SetVar("fifthUser", statements[4].actor.name);

  //Sets the score of the top 5 of the leaderboard
  player.SetVar("firstScore", statements[0].result.score.raw);
  player.SetVar("secondScore", statements[1].result.score.raw);
  player.SetVar("thirdScore", statements[2].result.score.raw);
  player.SetVar("fourthScore", statements[3].result.score.raw);
  player.SetVar("fifthScore", statements[4].result.score.raw);

  //Sets the avatar choice of the top 5 of the leaderboard
  player.SetVar("firstAvatar", statements[0].result.response);
  player.SetVar("secondAvatar", statements[1].result.response);
  player.SetVar("thirdAvatar", statements[2].result.response);
  player.SetVar("fourthAvatar", statements[3].result.response);
  player.SetVar("fifthAvatar", statements[4].result.response);

}
