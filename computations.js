
// Financial variables
var inflationsrate   = 0.017
var exchange_rate    = 1.25 									// How many $ for 1 €

// Variables for oil prices
var mineralölsteuer  = {"diesel": 0.4704, "benzin":0.6545} 		// € per L
var deckungsbeitrag  = {"diesel": 0.1563, "benzin":0.1227}		// € per L
var mehrwertsteuer   = 0										// No VAT for professionals
var price_per_barrel = {"2020": 117, "2030": 124, "2050": 128}	// In $-2011
var price_per_barrel_year = 2011								// Year of the prevision
var price_per_liter_eur = price_per_barrel / (exchange_rate * 158) // 158 liters in a barrel

// Variables for evolution of energy consumption in % of reduction per decade
var verbrauchsentwicklung = {
	"benzin":  {"2010": -.3, "2020": -.12},
	"diesel":  {"2010": -.26, "2020": -.1},
	"LNF":     {"2010": -.14, "2020": -.1},
	"BEV":     {"2010": -.15, "2020": -.01},
	"BEV-LNF": {"2010": 0, "2020": -.01}
}

// Size of the engine (for oil consumption)
var price_of_lubricant = 8
var hubraum = {
	"benzin": {"klein": 1137, "mittel": 1375,"groß": 1780},
	"diesel": {"klein": 1383, "mittel": 1618,"groß": 1929, "LNF1": 1722, "LNF2": 2140}
}

// Liters or kWh per 100 km
var verbrauch = {
	"benzin": {"klein": 6.94, "mittel": 8.08,"groß": 8.86},
	"diesel": {"klein": 4.99, "mittel": 6,"groß": 6.39, "LNF1": 8.4, "LNF2": 9.8},
	"BEV":    {"klein": .15, "mittel": .19,"groß": .21, "LNF1": .25, "LNF2": .30},
	"hybrid": {"klein": 5.21, "mittel": 6.06,"groß": 6.64}
				}

// Insurance in €/year
var versicherung = {
	"benzin": {"klein": 721, "mittel": 836,"groß": 1025},
	"diesel": {"klein": 785, "mittel": 901,"groß": 1093, "LNF1": 903, "LNF2": 1209},
	"BEV":    {"klein": 721, "mittel": 836,"groß": 1025, "LNF1": 903, "LNF2": 1209}
				}

// Yearly tax in €
var kfzsteuer = {
	"benzin": {"klein": 66.6, "mittel": 108.5,"groß": 137.8},
	"diesel": {"klein": 105.33, "mittel": 193.19,"groß": 227.01, "LNF1": 293.63, "LNF2": 390.59},
	"BEV":    {"klein": 0, "mittel": 0,"groß": 0, "LNF1": 0, "LNF2": 0}
				}

// Yearly check up in €
var untersuchung = {
	"benzin": {"HU": 53.5, "AU": 41},
	"diesel": {"HU": 53.5, "AU": 41},
	"BEV":    {"HU": 53.5, "AU": 0}
				}

// Variables for repairs
var faktor_BEV = 0.82 	// Discount for repairs of electro vehicles
var reperaturkosten = {
	"benzin": {
		"klein": {
			"inspektion": 18.20,
			"reparatur": 28,
			"reifen": 12,
			"sonstige": 0
		},
		"mittel": {
			"inspektion": 19.6,
			"reparatur": 29.7,
			"reifen": 17.7,
			"sonstige": 0
		},
		"groß": {
			"inspektion": 22,
			"reparatur": 34.6,
			"reifen": 32.4,
			"sonstige": 0
		}  
	},
	"diesel": {
		"klein": {
			"inspektion": 19.4,
			"reparatur": 29.7,
			"reifen": 13.1,
			"sonstige": 0
		},
		"mittel": {
			"inspektion": 18.3,
			"reparatur": 30.4,
			"reifen": 19.9,
			"sonstige": 0
		},
		"groß": {
			"inspektion": 21.7,
			"reparatur": 34.4,
			"reifen": 27.4,
			"sonstige": 0
		},
		"LNF1": {
			"inspektion": 23,
			"reparatur": 32,
			"reifen": 18,
			"sonstige": 0
		},
		"LNF2": {
			"inspektion": 25,
			"reparatur": 41,
			"reifen": 26,
			"sonstige": 0
		}      
	}
}

// Corrects amounts for inflation
function getCurrentPrice(amount, originalYear, wishedYear){
	return amount * Math.pow(1+inflationsrate, wishedYear - originalYear)
}

// Gets the total workshop costs in €
function getMaintenanceCosts(energy_type, car_type, mileage){
	var total_maintenance_costs = 0
	if (energy_type == "BEV" && car_type != "LNF1" && car_type != "LNF2") {
		var tires = reperaturkosten["benzin"][car_type]["reifen"];
		var inspection = reperaturkosten["benzin"][car_type]["inspektion"];
		var repairs = reperaturkosten["benzin"][car_type]["reparatur"] * faktor_BEV;
		total_maintenance_costs = tires + inspection + repairs;
	} else if (energy_type == "BEV" && (car_type == "LNF1" || car_type == "LNF2")) {
		tires = reperaturkosten["diesel"][car_type]["reifen"];
		inspection = reperaturkosten["diesel"][car_type]["inspektion"];
		repairs = reperaturkosten["diesel"][car_type]["reparatur"] * faktor_BEV;
		total_maintenance_costs = tires + inspection + repairs;
	} else {
		var tires = reperaturkosten[energy_type][car_type]["reifen"];
		var inspection = reperaturkosten[energy_type][car_type]["inspektion"];
		var repairs = reperaturkosten[energy_type][car_type]["reparatur"];
		total_maintenance_costs = tires + inspection + repairs;
	}
	return ((total_maintenance_costs * 12) / 20000) * mileage
}

// These functions returns the fixed costs in € 2014
function getTaxes(energy_type, car_type) {
	return kfzsteuer[energy_type][car_type];
}

function getCheckUpCosts(energy_type) {
	return untersuchung[energy_type]["AU"] + untersuchung[energy_type]["HU"];
}

function getInsurance(energy_type, car_type) {
	return insurance = versicherung[energy_type][car_type];
}

function getFixedCosts(energy_type, car_type) {
	return getTaxes(energy_type, car_type) + getCheckUpCosts(energy_type) + getInsurance(energy_type, car_type);
}

// Returns a cost in € 2014/km
function getLubricantConsumption(energy_type, car_type) {
	var lubricant_consumption = hubraum[energy_type][car_type] / 2000 * (0.5/1000)
	return price_of_lubricant * lubricant_consumption
}

// Returns a consumption in l/100km
function getConsumption(energy_type, car_type, year) {
	var consumption = verbrauch[energy_type][car_type];
	var improvement_first_decade = verbrauchsentwicklung[energy_type]["2010"];
	var yearly_improvement_first_decade = Math.pow((1 + improvement_first_decade), (1/10)) - 1;
	var improvement_second_decade = verbrauchsentwicklung[energy_type]["2020"];
	var yearly_improvement_second_decade = Math.pow(1 + improvement_second_decade, .1) - 1;
	
	// Need to take into account the rate of improvement of the previous decade
	if (year > 2020) {
		consumption *= Math.pow(1+yearly_improvement_first_decade, year - 2014);
		consumption *= Math.pow(1+yearly_improvement_second_decade, year - 2020);
	} else {
		consumption *= Math.pow(1+yearly_improvement_first_decade, year - 2014);
	}

	return consumption;
}

// Returns a price in € per L or € per kWh
function getEnergyPrice(energy_type, current_year, estimation_year) {
	switch(energy_type) {
	    case "diesel":
	    case "benzin":
	    	// Finds the closest esimate
	    	var shortest_difference = 99;
	    	var ppb = 0;
	    	for (year in price_per_barrel) {
	    		if (Math.abs(year - estimation_year) < shortest_difference) {
	    			shortest_difference = Math.abs(year - estimation_year);
	    			ppb = price_per_barrel[year];
	    		}
	    	}
	    	// Computes the price based on the estimate in USD, then adds taxes
	    	var price_baseyear = ppb / (exchange_rate * 158);
	        var price_per_l = getCurrentPrice(price_baseyear, price_per_barrel_year, current_year);
	        price_per_l += mineralölsteuer[energy_type] + deckungsbeitrag[energy_type];
	        price_per_l *= (1 + mehrwertsteuer);
	        return price_per_l;
	        break;
	    default:
	        throw "energy_type can only be diesel, benzin of elektro"
	}
}

function getEnergyCosts(mileage, energy_price){
	return mileage * energy_price;
}

console.log(getCurrentPrice(0.5924050633, 2011, 2014))  		// Should be 0.6231342472
console.log(getEnergyPrice("benzin", 2014, 2050))				// Should be 1.46
console.log(getConsumption("benzin", "klein", 2014))			// Should be 6.94
console.log(getConsumption("benzin", "klein", 2020))			// Should be 5.69 --- not really. Problem in spreadsheet
console.log(getConsumption("benzin", "klein", 2021))			// Should be 5.62 --- not really. Problem in spreadsheet
console.log(getConsumption("benzin", "klein", 2025))			// Should be 5.35 --- not really. Problem in spreadsheet
console.log(getLubricantConsumption("benzin", "klein"))			// Should be 0.0023
console.log(getFixedCosts("benzin", "mittel"))					// Should be 1039
console.log(getMaintenanceCosts("benzin", "mittel", 15000))		// Should be 603