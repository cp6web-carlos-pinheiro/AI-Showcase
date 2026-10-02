export interface City {
  name: string;
  latitude: number;
  longitude: number;
  countryCode: string;
  timezone: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitationProbability: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
  weatherCode: number;
  units: {
    temperature: string;
    apparentTemperature: string;
    humidity: string;
    precipitationProbability: string;
    windSpeed: string;
    windDirection: string;
  };
}

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country_code: string;
  timezone: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface ForecastCurrentUnits {
  temperature_2m: string;
  apparent_temperature: string;
  relative_humidity_2m: string;
  precipitation_probability: string;
  wind_speed_10m: string;
  wind_direction_10m: string;
}

export interface ForecastCurrent {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  precipitation_probability: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  is_day: number;
  weather_code: number;
  precipitation?: number;
}

export interface ForecastResponse {
  current: ForecastCurrent;
  current_units: ForecastCurrentUnits;
  timezone: string;
}
