// Constants for fixed costs
const PURCHASE_COST = 1890;
const CONSULTATION_COST = 126;

// Sale tiers: array of objects with max price, rate, and label
const SALE_TIERS = [
  { max: 176400, rate: 0.03, label: 'Тариф 3.0% (до 176400 BYN)' },
  { max: 210000, rate: 0.025, label: 'Тариф 2.5% (176401-210000 BYN)' },
  { max: 243600, rate: 0.024, label: 'Тариф 2.4% (210001-243600 BYN)' },
  { max: 277200, rate: 0.023, label: 'Тариф 2.3% (243601-277200 BYN)' },
  { max: 315000, rate: 0.022, label: 'Тариф 2.2% (277201-315000 BYN)' },
  { max: 348600, rate: 0.021, label: 'Тариф 2.1% (315001-348600 BYN)' },
  { max: 382200, rate: 0.02, label: 'Тариф 2.0% (348601-382200 BYN)' },
  { max: 420000, rate: 0.019, label: 'Тариф 1.9% (382201-420000 BYN)' },
  { max: 441000, rate: 0.018, label: 'Тариф 1.8% (420001-441000 BYN)' },
  { max: 487200, rate: 0.017, label: 'Тариф 1.7% (441001-487200 BYN)' },
  { max: 520800, rate: 0.016, label: 'Тариф 1.6% (487201-520800 BYN)' },
  { max: 554400, rate: 0.015, label: 'Тариф 1.5% (520801-554400 BYN)' },
  { max: 588000, rate: 0.014, label: 'Тариф 1.4% (554401-588000 BYN)' },
  { max: 625800, rate: 0.013, label: 'Тариф 1.3% (588001-625800 BYN)' },
  { max: 659400, rate: 0.012, label: 'Тариф 1.2% (625801-659400 BYN)' },
  { max: 693000, rate: 0.011, label: 'Тариф 1.1% (659401-693000 BYN)' },
  { max: Infinity, rate: 0.01, label: 'Тариф 1.0% (свыше 693000 BYN)' }
];

/**
 * Calculates the cost based on property price and service type.
 */
function calculateCost() {
  const priceInput = document.getElementById('propertyPrice').value.trim();
  const serviceType = document.getElementById('serviceType').value;
  let cost = 0;
  let details = '';
  let errorMessage = '';

  // Sanitize and validate price
  const price = parseFloat(priceInput);
  if (isNaN(price) || price <= 0) {
    errorMessage = 'Введите корректную стоимость объекта (положительное число)';
  }

  // Validate service type
  if (!['sale', 'purchase', 'consultation'].includes(serviceType)) {
    errorMessage = 'Выберите корректный тип услуги';
  }

  if (errorMessage) {
    showError(errorMessage);
    return;
  }

  // Calculate based on service type
  if (serviceType === 'sale') {
    const tier = SALE_TIERS.find(t => price <= t.max);
    if (tier) {
      cost = price * tier.rate;
      details = tier.label;
    }
  } else if (serviceType === 'purchase') {
    cost = PURCHASE_COST;
    details = 'Фиксированная стоимость подбора варианта квартиры (1890 BYN)';
  } else if (serviceType === 'consultation') {
    cost = CONSULTATION_COST;
    details = 'Стоимость консультационных услуг (126 BYN)';
  }

  // Display result
  document.getElementById('resultAmount').innerHTML = `<strong>${cost.toFixed(2)} BYN</strong>`;
  document.getElementById('resultDetails').innerHTML = details;
  document.getElementById('calculationResult').style.display = 'block';
}

/**
 * Displays an error message in the result area.
 * @param {string} message - The error message to display.
 */
function showError(message) {
  document.getElementById('resultAmount').innerHTML = `<span style="color: red;">Ошибка: ${message}</span>`;
  document.getElementById('resultDetails').innerHTML = '';
  document.getElementById('calculationResult').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
  const showModalBtn = document.getElementById('showResolutionModal');
  const resolutionModal = new bootstrap.Modal(document.getElementById('resolutionModal'));

  if (showModalBtn) {
    showModalBtn.addEventListener('click', function (e) {
      e.preventDefault();
      resolutionModal.show();
    });
  }

  const showJusticeModalBtn = document.getElementById('showJusticeModal');
  const justiceModal = new bootstrap.Modal(document.getElementById('justiceModal'));

  if (showJusticeModalBtn) {
    showJusticeModalBtn.addEventListener('click', function (e) {
      e.preventDefault();
      justiceModal.show();
    });
  }
});
