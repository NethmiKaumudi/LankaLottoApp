import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pandas as pd

# Function to calculate MAPE
def mean_absolute_percentage_error(y_true, y_pred):
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    mask = y_true != 0
    return np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100 if mask.any() else np.inf

# Function to calculate RMSE
def root_mean_squared_error(y_true, y_pred):
    return np.sqrt(mean_squared_error(y_true, y_pred))

# Function to define Sri Lankan holidays
def get_holidays():
    april_holidays = []
    for year in [2023, 2024, 2025]:
        april_holidays.append(pd.DataFrame({
            'holiday': [f'new_year_{year}'] * 7,
            'ds': pd.date_range(start=f'{year}-04-12', end=f'{year}-04-18', freq='D'),
            'lower_window': [-3] * 7,
            'upper_window': [3] * 7
        }))

    vesak_dates = [
        '2023-05-04', '2023-05-05',
        '2024-05-22', '2024-05-23',
        '2025-05-12', '2025-05-13'
    ]
    vesak_holidays = pd.DataFrame({
        'holiday': ['vesak'] * len(vesak_dates),
        'ds': pd.to_datetime(vesak_dates),
        'lower_window': [-2] * len(vesak_dates),
        'upper_window': [2] * len(vesak_dates)
    })

    poya_dates = [
        '2023-01-06', '2023-02-05', '2023-03-06', '2023-04-05', '2023-06-03', '2023-07-03',
        '2024-01-25', '2024-02-23', '2024-03-24', '2024-04-23', '2024-06-21', '2024-07-20',
        '2025-01-13', '2025-02-12', '2025-03-13', '2025-04-12', '2025-06-10', '2025-07-09'
    ]
    poya_holidays = pd.DataFrame({
        'holiday': ['poya'] * len(poya_dates),
        'ds': pd.to_datetime(poya_dates),
        'lower_window': [-1] * len(poya_dates),
        'upper_window': [1] * len(poya_dates)
    })

    deepavali_dates = ['2023-11-12', '2024-10-31', '2025-10-20']
    deepavali_holidays = pd.DataFrame({
        'holiday': ['deepavali'] * len(deepavali_dates),
        'ds': pd.to_datetime(deepavali_dates),
        'lower_window': [-2] * len(deepavali_dates),
        'upper_window': [2] * len(deepavali_dates)
    })

    christmas_dates = ['2023-12-25', '2024-12-25', '2025-12-25']
    christmas_holidays = pd.DataFrame({
        'holiday': ['christmas'] * len(christmas_dates),
        'ds': pd.to_datetime(christmas_dates),
        'lower_window': [-3] * len(christmas_dates),
        'upper_window': [3] * len(christmas_dates)
    })

    return pd.concat(april_holidays + [vesak_holidays, poya_holidays, deepavali_holidays, christmas_holidays], ignore_index=True)