# NBA teams statistics parallel coordinates plot

Visually analyze the NBA teams statistics using parallel coordinates plot.
This is used for example to analyze the impact of 2pt vs 3pt shot frequency on the total score.

## Obtain data from NBA.com

**Note** that a copy of the data is already included in this repository.
The instructions below are needed to perform a data update, to add a new season statistics.

https://www.nba.com/termsofuse#nba-statistics on 2024-12-30 allow the use of statistics

> for legitimate news reporting or private, non-commercial purposes

The process of obtaining statistics in the `csv`format needed for visualization is described below,
using the example of `2023-24` season.

Obtain the statistics of all teams in the given season.
Go to https://www.nba.com/stats/teams/traditional?Season=2023-24,
and mouse select the table, including the `Season: 2023-24` text on the top left.
Save the mouse selection as `nba.com/2023-24-Traditional.txt` text file, relative to the root of this repository clone.
Execute the following command, to convert the `nba.com/2023-24-Traditional.txt` file into csv,
and save as `nba.com/2023-24-Traditional.csv`.

```shell
for filename in $(find nba.com -name "*.txt");
do
docker run --rm -it --name 2ptvs3pt -v $PWD:/opt/2ptvs3pt -w /opt/2ptvs3pt node:lts-slim \
       node txt2csv.js --filename ${filename} > ${filename}.csv
done
```

If desired, analogously obtain the statistics of the opponents from https://www.nba.com/stats/teams/opponent?Season=2023-24,
the `txt2csv.js` scripts automatically detects the `Traditional` and `Opponents` statistics file format.

Then join the selected csv files into one `nba.com.csv`.

```shell
cp nba.com/1996-97-Traditional.txt.csv nba.com.csv
grep -v Statistics nba.com/1997-98-Traditional.txt.csv >> nba.com.csv
grep -v Statistics nba.com/1998-99-Traditional.txt.csv >> nba.com.csv
grep -v Statistics nba.com/1999-00-Traditional.txt.csv >> nba.com.csv
grep -hv Statistics nba.com/2*-Traditional.txt.csv >> nba.com.csv
sed -i '' 's/LA Clippers/Los Angeles Clippers/' nba.com.csv
```
