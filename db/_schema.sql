CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS films (
  imdb TEXT PRIMARY KEY,
  channel TEXT,
  time TEXT,
  title TEXT,
  year INT
);

DROP TABLE IF EXISTS altChannelNames;
CREATE TABLE altChannelNames (
  altName TEXT PRIMARY KEY,
  name TEXT
);

INSERT INTO altChannelNames
VALUES
  ("BBC One HD", "BBC ONE N West"),
  ("BBC One London", "BBC ONE N West"),
  ("BBC Two England", "BBC TWO"),
  ("BBC Two HD", "BBC TWO"),
  ("ITV4HD", "ITV4"),
  ("BBC Four", "BBC FOUR"),
  ("ITV HD London", "ITV1"),
  ("ITV London", "ITV1"),
  ("GREAT! movies action", "GREAT! action"),
  ("GREAT! movies christmas", "GREAT! christmas"),
  ("Talking Pictures TV", "TalkingPictures TV"),
  ("BBC Four HD","BBC FOUR"),
  ("BBC One Wales HD","iPlayer"),
  ("Film4 HD","FILM4"),
  ("5SELECT","My5"),
  ("Channel 5 HD","Channel 5"),
  ("BBC Scotland HD","iPlayer"),
  ("5Action HD","5ACTION");

DROP TABLE IF EXISTS nonFilmChannels;
CREATE TABLE nonFilmChannels (
  name TEXT PRIMARY KEY
);

INSERT INTO nonFilmChannels
VALUES  
  ("TalkLiverpool"),
  ("QVC"),
  ("Really"),
  ("More 4"),
  ("TJC"),
  ("Yesterday"),
  ("QVC2"),
  ("Quest Red"),
  ("CBS Reality"),
  ("RealityXtra"),
  ("That's 60s"),
  ("Jewellery Maker"),
  ("HobbyMaker"),
  ("That's 90s"),
  ("TCC"),
  ("EarthxTV"),
  ("Create &amp; Craft"),
  ("WildEarth"),
  ("Freeview"),
  ("Ketchup TV"),
  ("Ketchup Too"),
  ("YAAAS!"),
  ("Pop Player"),
  ("Food Network"),
  ("HGTV"),
  ("Gems TV"),
  ("Challenge"),
  ("Ideal World"),
  ("That's TV (UK)"),
  ("GREAT! movies extra"),
  ("GREAT! christmas mix");
