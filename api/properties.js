const https = require('https');
const xml2js = require('xml2js');

const API_URL = 'https://realt.by/bff/proxy/export/api/export/token/e68b296c864d8a9';

function fetchProperties(limit = 20) {
  return new Promise((resolve, reject) => {
    https.get(API_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API returned status ${res.statusCode}`));
          return;
        }

        // Parse XML to JSON
        xml2js.parseString(data, { explicitArray: false, ignoreAttrs: false }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const properties = parseProperties(result, limit);
            resolve(properties);
          } catch (parseErr) {
            reject(parseErr);
          }
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function parseProperties(xmlData, limit) {
  const records = xmlData.uedb.records.record;
  const properties = [];

  for (const record of records) {
    if (properties.length >= limit) break;

    // Apply filters
    const archive = parseInt(record.archive) || 0;
    const terms = record.terms || '';
    const price = parseInt(record.price?._ || record.price || 0);

    if (archive !== 0 || !['ч', 'пр'].includes(terms) || price <= 0) {
      continue;
    }

    // Extract photos
    const photos = [];
    if (record.photos && record.photos.photo) {
      const photoArray = Array.isArray(record.photos.photo) ? record.photos.photo : [record.photos.photo];
      photoArray.forEach(photo => {
        if (photo.$ && photo.$.picture) {
          photos.push(photo.$.picture);
        }
      });
    }

    // Build features array
    const features = [];
    if (record.rooms) features.push(`Комнаты: ${record.rooms}`);
    if (record.area_total) features.push(`Площадь: ${record.area_total} м²`);
    if (record.area_living) features.push(`Жилая: ${record.area_living} м²`);
    if (record.area_kitchen) features.push(`Кухня: ${record.area_kitchen} м²`);
    if (record.building_year) features.push(`Год: ${record.building_year}`);
    if (record.heating_expanded) features.push(`Отопление: ${record.heating_expanded}`);
    if (record.storey && record.storeys) features.push(`Этаж: ${record.storey}/${record.storeys}`);
    if (record.house_type_expanded) features.push(`Тип дома: ${record.house_type_expanded}`);
    if (record.repair_state_expanded) features.push(`Ремонт: ${record.repair_state_expanded}`);

    // Build location
    let location = '';
    if (record.town_name) {
      location = record.town_name;
      if (record.street_name) location += ', ' + record.street_name;
      if (record.house_number) location += ' ' + record.house_number;
    } else if (record.state_district_name) {
      location = record.state_district_name;
    } else {
      location = record.state_region_name || '';
    }

    // Clean description
    const description = record.description ? record.description.replace(/<[^>]*>/g, '') : '';

    // Create property object
    const property = {
      title: `${record.object_type_expanded || 'Объект'} #${record.code || 'N/A'}`,
      location: location,
      price: price,
      type: record.object_type_expanded || 'Не указан',
      description: description,
      features: features,
      photos: photos
    };

    properties.push(property);
  }

  return properties;
}

// Mock data fallback
function getMockData() {
  return [
    {
      title: "Квартира в центре Минска",
      location: "Минск, Центр",
      price: 120000,
      type: "Квартира",
      description: "Уютная квартира с современным ремонтом.",
      features: ["3 комнаты", "Балкон", "Ремонт"],
      photos: ["https://via.placeholder.com/400x300?text=Property+1"]
    },
    {
      title: "Дом в пригороде",
      location: "Минский район",
      price: 250000,
      type: "Дом",
      description: "Просторный дом с большим участком.",
      features: ["5 комнат", "Гараж", "Сад"],
      photos: ["https://via.placeholder.com/400x300?text=Property+2"]
    }
  ];
}

module.exports = { fetchProperties, getMockData };
