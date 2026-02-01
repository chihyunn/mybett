export const SPORTS = ['NBA', 'NHL', 'MLB', 'NFL', 'EPL', 'LOL_LCK', 'LOL_LPL'] as const;
export type SportName = (typeof SPORTS)[number];

export const TEAMS: Record<SportName, string[]> = {
  NBA: [
    'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
    'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
    'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
    'LA Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
    'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
    'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
    'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
    'Utah Jazz', 'Washington Wizards',
  ],
  NHL: [
    'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres',
    'Calgary Flames', 'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche',
    'Columbus Blue Jackets', 'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers',
    'Florida Panthers', 'Los Angeles Kings', 'Minnesota Wild', 'Montreal Canadiens',
    'Nashville Predators', 'New Jersey Devils', 'New York Islanders', 'New York Rangers',
    'Ottawa Senators', 'Philadelphia Flyers', 'Pittsburgh Penguins', 'San Jose Sharks',
    'Seattle Kraken', 'St. Louis Blues', 'Tampa Bay Lightning', 'Toronto Maple Leafs',
    'Vancouver Canucks', 'Vegas Golden Knights', 'Washington Capitals', 'Winnipeg Jets',
  ],
  MLB: [
    'Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox',
    'Chicago Cubs', 'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians',
    'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 'Kansas City Royals',
    'Los Angeles Angels', 'Los Angeles Dodgers', 'Miami Marlins', 'Milwaukee Brewers',
    'Minnesota Twins', 'New York Mets', 'New York Yankees', 'Oakland Athletics',
    'Philadelphia Phillies', 'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants',
    'Seattle Mariners', 'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers',
    'Toronto Blue Jays', 'Washington Nationals',
  ],
  NFL: [
    // AFC East
    'Buffalo Bills', 'Miami Dolphins', 'New England Patriots', 'New York Jets',
    // AFC North
    'Baltimore Ravens', 'Cincinnati Bengals', 'Cleveland Browns', 'Pittsburgh Steelers',
    // AFC South
    'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 'Tennessee Titans',
    // AFC West
    'Denver Broncos', 'Kansas City Chiefs', 'Las Vegas Raiders', 'Los Angeles Chargers',
    // NFC East
    'Dallas Cowboys', 'New York Giants', 'Philadelphia Eagles', 'Washington Commanders',
    // NFC North
    'Chicago Bears', 'Detroit Lions', 'Green Bay Packers', 'Minnesota Vikings',
    // NFC South
    'Atlanta Falcons', 'Carolina Panthers', 'New Orleans Saints', 'Tampa Bay Buccaneers',
    // NFC West
    'Arizona Cardinals', 'Los Angeles Rams', 'San Francisco 49ers', 'Seattle Seahawks',
  ],
  EPL: [
    // English Premier League (20 teams)
    'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford',
    'Brighton & Hove Albion', 'Chelsea', 'Crystal Palace', 'Everton',
    'Fulham', 'Ipswich Town', 'Leicester City', 'Liverpool',
    'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest',
    'Southampton', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton Wanderers',
  ],
  LOL_LCK: [
    // League of Legends Champions Korea (10 teams)
    'T1', 'Gen.G', 'Hanwha Life Esports', 'Dplus KIA', 'KT Rolster',
    'DRX', 'Kwangdong Freecs', 'Nongshim RedForce', 'OK BRION', 'FearX',
  ],
  LOL_LPL: [
    // League of Legends Pro League - China (17 teams)
    'JD Gaming', 'Bilibili Gaming', 'Top Esports', 'Weibo Gaming', 'LNG Esports',
    'Royal Never Give Up', 'Invictus Gaming', 'FunPlus Phoenix', 'OMG', 'EDward Gaming',
    'Team WE', 'Rare Atom', "Anyone's Legend", 'ThunderTalk Gaming', 'Ninjas in Pyjamas',
    'Ultra Prime', 'TT Gaming',
  ],
};
