# Model Ready Data
Model_Ready.csv:
- **Feed this to your model**
- Contains monthly aggregated foodbank data + relevant columns from Socioeconomic data + lagged columns for modelling
- *Data for certain socioeconomic factors may be missing from 2015-2019, use df.dropna() to remove those incomplete rows if you don't want to use them to train your model*
- *Please use the (socioeconomic factor)_lag1 columns for any socioeconomic factors you are including in your feature set to accurately reflect the data that will be available in a real-life setting*
- *Please double-check and see if further scaling/additional columns are needed depending on what model you are using*
- *Feature selection and tuning is to your discretion*

# Socioeconomic Data
- homeless_chronic.csv (Cleaned chronic homeless data)
- homeless_total.csv (Cleaned total homeless data)
- odsp_df.csv (Cleaned ODSP data)
- ow_df.csv (Cleaned Ontario Works data)
- For CPI data see "CPI_unadjusted_Ontario.csv" in "401 Raw Data"
- For Unemployment data see "1410028701_databaseLoadingData.csv" in "401 Raw Data"

