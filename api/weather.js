export default async function handler(req, res) {
  try {
    const response = await fetch('https://www.bahrain.bh/wps/portal/ar/home', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en;q=0.5',
      }
    });

    const html = await response.text();
    const weatherData = parseWeatherFromHTML(html);

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(weatherData);
  } catch (error) {
    console.error('Weather fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}

function parseWeatherFromHTML(html) {
  const modalStart = html.indexOf('id="modal-weather"');
  const modalEnd = html.indexOf('<!-- End - Weather Popup Modal -->');

  if (modalStart === -1 || modalEnd === -1) {
    throw new Error('Weather modal not found in HTML');
  }

  const modalHtml = html.substring(modalStart, modalEnd);

  const dateMatch = modalHtml.match(/modal-title[^>]*>\s*\n?\s*([^<]+)/);
  const currentDate = dateMatch ? dateMatch[1].trim() : '';

  const conditionMatch = modalHtml.match(/today-weather">([^<]+)/);
  const condition = conditionMatch ? conditionMatch[1].trim() : '';

  const iconMatch = modalHtml.match(/main-weather-image[\s\S]*?src="([^"]+)"/);
  const weatherIcon = iconMatch ? iconMatch[1] : '';

  const currentTempMatch = modalHtml.match(/dir="ltr">(\d+)\s*\u00b0C/);
  const currentTemp = currentTempMatch ? parseInt(currentTempMatch[1]) : 0;

  const minTempMatch = modalHtml.match(/low-temp-data[\s\S]*?temp-number">(\d+)/);
  const minTemp = minTempMatch ? parseInt(minTempMatch[1]) : 0;

  const maxTempMatch = modalHtml.match(/high-temp-data[\s\S]*?temp-number">(\d+)/);
  const maxTemp = maxTempMatch ? parseInt(maxTempMatch[1]) : 0;

  const humidityMatch = modalHtml.match(/humidity-number[^>]*>(\d+)\s*%/);
  const humidity = humidityMatch ? parseInt(humidityMatch[1]) : 0;

  const sunriseMatch = modalHtml.match(/sunrise-number">([^<]+)/);
  const sunrise = sunriseMatch ? sunriseMatch[1].trim() : '';

  const sunsetMatch = modalHtml.match(/sunset-number">([^<]+)/);
  const sunset = sunsetMatch ? sunsetMatch[1].trim() : '';

  const forecast = [];
  const dayBlocks = modalHtml.split('class="day-data"');
  for (let i = 1; i < dayBlocks.length; i++) {
    const block = dayBlocks[i];
    const dayNameMatch = block.match(/day-text">([^<]+)/);
    const dayDateMatch = block.match(/day-date">([^<]+)/);
    const dayIconMatch = block.match(/src="([^"]+)"/);
    const dayCondMatch = block.match(/alt="([^"]+)"/);
    const dayTempMatch = block.match(/day-temp[^>]*>(\d+)(?:&deg;|\u00b0)-(\d+)(?:&deg;|\u00b0)/);

    if (dayNameMatch && dayDateMatch && dayTempMatch) {
      forecast.push({
        dayName: dayNameMatch[1].trim(),
        date: dayDateMatch[1].trim(),
        icon: dayIconMatch ? dayIconMatch[1] : '',
        condition: dayCondMatch ? dayCondMatch[1].trim() : '',
        minTemp: parseInt(dayTempMatch[1]),
        maxTemp: parseInt(dayTempMatch[2]),
      });
    }
  }

  return {
    currentDate,
    condition,
    weatherIcon,
    currentTemp,
    minTemp,
    maxTemp,
    humidity,
    sunrise,
    sunset,
    forecast,
  };
}
