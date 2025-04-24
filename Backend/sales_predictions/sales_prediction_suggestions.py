#sales_prediction_suggestions.py
import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, timedelta
import logging
from .utils import get_holidays  # Removed mean_absolute_percentage_error and root_mean_squared_error
# Removed cross_validation and performance_metrics imports

# Suppress cmdstanpy and prophet logs
logging.getLogger('cmdstanpy').setLevel(logging.WARNING)
logging.getLogger('prophet').setLevel(logging.WARNING)

# Function to load and prepare data
def load_data(file_path):
    data = pd.read_csv(file_path)
    daily_totals = data.groupby('Date').agg({
        'NLB Sales Ticket': 'sum',
        'DLB Sales Ticket': 'sum',
        'Total Sales Ticket': 'sum'
    }).reset_index()
    daily_totals['Date'] = pd.to_datetime(daily_totals['Date'])
    daily_totals['DayOfWeek'] = daily_totals['Date'].dt.dayofweek
    daily_totals['Month'] = daily_totals['Date'].dt.month
    daily_totals['Year'] = daily_totals['Date'].dt.year
    return daily_totals

# Function to add lag features and rolling averages
def add_lag_features(df):
    for lag in [1, 2, 7, 14, 28]:
        df[f'NLB_lag{lag}'] = df['NLB Sales Ticket'].shift(lag)
        df[f'DLB_lag{lag}'] = df['DLB Sales Ticket'].shift(lag)
        df[f'Total_lag{lag}'] = df['Total Sales Ticket'].shift(lag)
    
    df['NLB_roll7'] = df['NLB Sales Ticket'].rolling(window=7, min_periods=1).mean()
    df['NLB_roll28'] = df['NLB Sales Ticket'].rolling(window=28, min_periods=1).mean()
    df['DLB_roll7'] = df['DLB Sales Ticket'].rolling(window=7, min_periods=1).mean()
    df['DLB_roll28'] = df['DLB Sales Ticket'].rolling(window=28, min_periods=1).mean()
    df['Total_roll7'] = df['Total Sales Ticket'].rolling(window=7, min_periods=1).mean()
    df['Total_roll28'] = df['Total Sales Ticket'].rolling(window=28, min_periods=1).mean()
    
    df['Total_trend'] = (df['Total_roll7'] - df['Total_roll7'].shift(7)) / 7
    return df.dropna()

# Function to train and predict (removed evaluation metrics)
def train_predict_evaluate(df_train, df_test, df_full, target_column, lag_columns, roll_columns, forecast_days=7, start_date=None, seasonality_mode='multiplicative'):
    columns = ['Date', target_column] + lag_columns + roll_columns + ['DayOfWeek', 'Month', 'Year', 'Total_trend']
    prophet_train = df_train[columns].rename(columns={'Date': 'ds', target_column: 'y'})
    prophet_test = df_test[columns].rename(columns={'Date': 'ds', target_column: 'y'})

    max_cap = 2 * df_full[target_column].max()
    prophet_train['cap'] = max_cap
    prophet_train['floor'] = 0
    prophet_test['cap'] = max_cap
    prophet_test['floor'] = 0

    model = Prophet(
        growth='logistic',
        yearly_seasonality=True,
        daily_seasonality=False,
        holidays=get_holidays(),
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        holidays_prior_scale=50.0,
        seasonality_mode=seasonality_mode
    )
    model.add_seasonality(name='weekly', period=7, fourier_order=5, prior_scale=5.0)
    model.add_seasonality(name='monthly', period=30.42, fourier_order=10, prior_scale=20.0)
    
    for lag_col in lag_columns:
        model.add_regressor(lag_col)
    for roll_col in roll_columns:
        model.add_regressor(roll_col)
    model.add_regressor('DayOfWeek')
    model.add_regressor('Month')
    model.add_regressor('Year')
    model.add_regressor('Total_trend')
    model.fit(prophet_train)

    # Removed evaluation metrics (MAE, MAPE, RMSE, cross-validation)
    if start_date:
        last_date = pd.to_datetime(start_date)
    else:
        last_date = df_full['Date'].max()
    future_dates = pd.date_range(start=last_date, periods=forecast_days, freq='D')

    future_predictions = []
    last_data = df_full[df_full['Date'] <= last_date].tail(28).copy()
    for date in future_dates:
        input_data = pd.DataFrame({
            'ds': [date],
            lag_columns[0]: [last_data[target_column].tail(1).mean()],
            lag_columns[1]: [last_data[target_column].tail(2).mean()],
            lag_columns[2]: [last_data[target_column].tail(7).mean()],
            lag_columns[3]: [last_data[target_column].tail(14).mean()],
            lag_columns[4]: [last_data[target_column].tail(28).mean()],
            roll_columns[0]: [last_data[target_column].tail(7).mean()],
            roll_columns[1]: [last_data[target_column].tail(28).mean()],
            'DayOfWeek': [date.dayofweek],
            'Month': [date.month],
            'Year': [date.year],
            'Total_trend': [last_data['Total_trend'].tail(1).mean()],
            'cap': [max_cap],
            'floor': [0]
        })
        pred = model.predict(input_data)
        pred['yhat'] = pred['yhat'].clip(lower=0, upper=max_cap)
        future_predictions.append(pred[['ds', 'yhat']].iloc[0])
        new_row = pd.DataFrame({
            'Date': [date],
            target_column: [pred['yhat'].iloc[0]],
            'DayOfWeek': [date.dayofweek],
            'Month': [date.month],
            'Year': [date.year],
            'Total_trend': [last_data['Total_trend'].tail(1).mean()]
        })
        last_data = pd.concat([last_data, new_row], ignore_index=True)

    forecast_future = pd.DataFrame(future_predictions)
    forecast_future['yhat'] = forecast_future['yhat'].rolling(window=3, min_periods=1, center=True).mean()
    return forecast_future[['ds', 'yhat']], model  # Removed metrics from return value

# Function to provide sales improvement suggestions
def provide_sales_suggestions(predictions, period_choice):
    suggestions = [
        "Introduce a loyalty program offering a free ticket after 10 purchases to retain customers.",
        "Launch a 'Daily Lucky Draw' to keep sales consistent throughout the period.",
        "Create a 'Mega Draw Event' on a chosen day to attract more customers and boost sales.",
        "Offer an NLB loyalty discount to encourage repeat purchases.",
        "Host a 'DLB Winner Spotlight' event to generate excitement and increase DLB ticket sales.",
        "Promote ticket purchases through a mobile app with push notifications for special offers.",
        "Collect customer feedback via the app to improve future offerings."
    ]
    
    if period_choice.lower() == 'week':
        suggestions.append("Introduce a 'Daily Bonus Prize' to maintain engagement across weekdays and weekends.")
    elif period_choice.lower() == 'month':
        vesak_days = predictions[predictions['Date'].isin([pd.to_datetime('2025-05-12').date(), pd.to_datetime('2025-05-13').date()])]
        if not vesak_days.empty:
            suggestions.append("Launch a 'Vesak Countdown Offer' to build excitement around Vesak days (May 12–13).")
    
    return suggestions

# Function to predict based on user choice
def predict_sales(df, period_choice):
    train_data = df[df['Date'] <= '2025-02-28']
    test_data = df[df['Date'] >= '2025-03-01']

    lag_columns_nlb = ['NLB_lag1', 'NLB_lag2', 'NLB_lag7', 'NLB_lag14', 'NLB_lag28']
    lag_columns_dlb = ['DLB_lag1', 'DLB_lag2', 'DLB_lag7', 'DLB_lag14', 'DLB_lag28']
    lag_columns_total = ['Total_lag1', 'Total_lag2', 'Total_lag7', 'Total_lag14', 'Total_lag28']
    roll_columns_nlb = ['NLB_roll7', 'NLB_roll28']
    roll_columns_dlb = ['DLB_roll7', 'DLB_roll28']
    roll_columns_total = ['Total_roll7', 'Total_roll28']

    # Set start_date to tomorrow (April 9, 2025, since today is April 8, 2025)
    start_date = pd.to_datetime(datetime.today().date()) + timedelta(days=1)

    # Determine forecast period
    if period_choice.lower() == 'week':
        forecast_days = 7
        end_date = start_date + pd.Timedelta(days=6)
        period_label = f"Week ({start_date.strftime('%Y-%m-%d')}–{end_date.strftime('%Y-%m-%d')})"
    elif period_choice.lower() == 'month':
        forecast_days = 30
        end_date = start_date + pd.Timedelta(days=29)
        period_label = f"Period ({start_date.strftime('%Y-%m-%d')}–{end_date.strftime('%Y-%m-%d')})"
    else:
        raise ValueError("Period must be 'week' or 'month'")

    # Predict for NLB, DLB, and Total
    forecast_nlb, model_nlb = train_predict_evaluate(
        train_data, test_data, df, 'NLB Sales Ticket', lag_columns_nlb, roll_columns_nlb, forecast_days=forecast_days, start_date=start_date
    )
    forecast_dlb, model_dlb = train_predict_evaluate(
        train_data, test_data, df, 'DLB Sales Ticket', lag_columns_dlb, roll_columns_dlb, forecast_days=forecast_days, start_date=start_date
    )
    forecast_total, model_total = train_predict_evaluate(
        train_data, test_data, df, 'Total Sales Ticket', lag_columns_total, roll_columns_total, forecast_days=forecast_days, start_date=start_date
    )

    # Combine predictions
    predictions = pd.DataFrame({
        'Date': forecast_nlb['ds'].dt.date,
        'NLB Predicted Tickets': forecast_nlb['yhat'].round(0),
        'DLB Predicted Tickets': forecast_dlb['yhat'].round(0),
        'Total Predicted Tickets': forecast_total['yhat'].round(0)
    })

    # Filter predictions to the exact date range
    predictions = predictions[(predictions['Date'] >= start_date.date()) & (predictions['Date'] <= end_date.date())]

    # Add summary statistics for the period
    total_sales = predictions['Total Predicted Tickets'].sum()
    avg_daily_sales = predictions['Total Predicted Tickets'].mean()

    # Get suggestions
    suggestions = provide_sales_suggestions(predictions, period_choice)

    # Prepare response data
    predictions_data = predictions.to_dict(orient='records')
    summary = {
        'period_label': period_label,
        'total_sales': float(total_sales),
        'avg_daily_sales': float(avg_daily_sales)
    }

    return predictions_data, summary, suggestions  # Removed accuracy_metrics