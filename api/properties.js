const https = require('https');
const xml2js = require('xml2js');
const { insertProperty, getActiveProperties, archiveMissingProperties, getAllUnids } = require('../db');

const API_URL = 'https://realt.by/bff/proxy/export/api/export/token/e68b296c864d8a9';

async function fetchAndSyncProperties() {
  return new Promise((resolve, reject) => {
    https.get(API_URL, async (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API returned status ${res.statusCode}`));
          return;
        }

        // Parse XML to JSON
        xml2js.parseString(data, { explicitArray: false, ignoreAttrs: false }, async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const parsedProperties = parseProperties(result);
            await syncProperties(parsedProperties);
            resolve();
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

function fetchProperties(limit = 12, offset = 0, filters = {}) {
  return getActiveProperties(limit, offset, filters);
}

function parseProperties(xmlData) {
  const records = Array.isArray(xmlData.uedb.records.record) ? xmlData.uedb.records.record : [xmlData.uedb.records.record];
  const properties = [];

  for (const record of records) {
    // Extract unid from attributes
    const unid = record.$ && record.$.unid ? record.$.unid : null;
    
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

    // Extract coordinates
    const lat = record.position_y ? parseFloat(record.position_y) : null;
    const lng = record.position_x ? parseFloat(record.position_x) : null;

    // Extract contact info
    const contact_name = record.contact_name || record.responsible_first_name + ' ' + record.responsible_last_name;
    const contact_phone = record.contact_phone_1 ? `${record.contact_phone_code_1}${record.contact_phone_1}` : '';

    // Operation type
    const operation = terms === 'ч' ? 'продажа' : 'аренда';

    // Create property object for DB
    const property = {
      unid: unid,
      title: `${record.object_type_expanded || 'Объект'} #${record.code || 'N/A'}`,
      location: location,
      price: price,
      currency: record.price_currency_expanded || 'USD',
      type: record.object_type_expanded || 'Не указан',
      operation: operation,
      description: description,
      features: features,
      photos: photos,
      lat: lat,
      lng: lng,
      contact_name: contact_name,
      contact_phone: contact_phone,
      last_update: record.last_modification || new Date().toISOString(),
      archive: 0
    };

    properties.push(property);
  }

  return properties;
}

async function syncProperties(parsedProperties) {
  const currentUnids = parsedProperties.map(p => p.unid);

  // Insert or update properties
  for (const property of parsedProperties) {
    try {
      await insertProperty(property);
    } catch (err) {
      console.error('Error inserting property:', err);
    }
  }

  // Archive properties not in current feed
  try {
    const archivedCount = await archiveMissingProperties(currentUnids);
    console.log(`Archived ${archivedCount} properties`);
  } catch (err) {
    console.error('Error archiving properties:', err);
  }
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

module.exports = { fetchProperties, fetchAndSyncProperties, getMockData };
