import pandas as pd
import numpy as np
import os

def load_and_clean(filepath):

    df = pd.read_csv(
        filepath,
        parse_dates=["month"]
    )
    df = (
        df
        .sort_values("month")
        .reset_index(drop=True)
    )
    same_month_leakage = [
        "total_visits",
        "unique_clients",
        "unique_households",
        "avg_household_size",
        "avg_client_age"
    ]

    unlagged_external = [
        "ow_cases_official",
        "ow_beneficiaries",
        "odsp_cases_official",
        "odsp_beneficiaries",
        "total_homeless",
        "total_chronic_homeless",
        "cpi_all_items",
        "cpi_food",
        "cpi_shelter",
        "unemployment",
        "unemployment_rate"
    ]

    cols_to_drop = (
        same_month_leakage
        +
        unlagged_external
    )

    df_model_ready = df.drop(
        columns=[
            c for c in cols_to_drop
            if c in df.columns
        ]
    )

    df_model_ready = (
        df_model_ready
        .dropna()
        .reset_index(drop=True)
    )

    return df, df_model_ready

def add_gam_features(df):
    """GAM-specific feature engineering, applied on top of load_and_clean() output."""
    df = df.copy()

    # Numeric time index for the trend smooth term
    df["time_index"] = np.arange(len(df))

    # Log-transform target to stabilize variance (demand has grown substantially,
    # volatility has increased over time per earlier EDA)
    df["log_total_people_served"] = np.log(df["total_people_served"])

    return df

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(script_dir, "..", "..", "clean_data", "Model_Ready.csv")

    df_full, df_model_ready = load_and_clean(input_path)
    gam_df = add_gam_features(df_model_ready)

    print(f"Full history: {df_full['month'].min()} to {df_full['month'].max()}, {len(df_full)} rows")
    print(f"Model-ready: {df_model_ready['month'].min()} to {df_model_ready['month'].max()}, {len(df_model_ready)} rows")

    df_full.to_csv(os.path.join(script_dir, "gam_full_history.csv"), index=False)
    gam_df.to_csv(os.path.join(script_dir, "gam_model_ready.csv"), index=False)
    print("Saved cleaned files.")
