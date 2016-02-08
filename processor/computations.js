
// Financial variables
var inflationsrate   = 0.017;	// That's 1.7% per year
var exchange_rate    = 1.25; 	// How many $ for 1 €

// Variables to compute the amortization costs
var abschreibungszeitraum = 6;  // amortization period
var unternehmenssteuersatz = .3; // corporate tax
var sonder_afa = true;			// special accounting rule to increase amortization for electro vehicles in the first year

// Vehicle acquisition price
var nettolistenpreise = {
	"benzin":{
		"klein":{"2014": 10121},
		"mittel":{"2014": 16282},
		"groß":{"2014": 29595}
	},
	"diesel": {
		"LNF1":{"2014": 20346},
		"LNF2":{"2014": 34069}
	}
}

// Increase in acquisition prices
var kostensteigerung20102030 = {
	"benzin":{
		"klein": 0.14,
		"mittel": 0.07,
		"groß": 0.04
	},
	"diesel":{
		"klein": .09,
		"mittel": .03,
		"groß": .02,
		"LNF1": .01,
		"LNF2": .01
	}
}

// Surcharge for the price of vehicle compared to benzin in EUR
var aufpreis = {
	"diesel":{
		"klein": 2564,
		"mittel": 2340,
		"groß": 2232,
		"LNF1": 2000,
		"LNF2": 2500
	},
	"hybrid": {
		"klein": 2564,
		"mittel": 2340,
		"groß": 2232
	},
	"BEV":{
		"klein":{"2014": 1500},
		"mittel":{"2014": 2000},
		"groß":{"2014": 2500},
		"LNF1":{"2014": 2000},
		"LNF2":{"2014": 2500}
	}
}

// Variables for the battery
var entladetiefe = 0.8
var reichweite = 150 			// km
var batteriepreise = {			// in € per kWh
	"2014": 400.0,	
	"2015": 380.0,
	"2016": 350.0,
	"2017": 300.0,
	"2018": 290.0

}

// Charging options costs in EUR
var lademöglichkeiten = { 
	"Wallbox 3,7kW": { "acquisition": 350, "maintenance": 15},
	"Wallbox bis 22kW": { "acquisition": 800, "maintenance": 50},
	"Ladesäule 22kW": { "acquisition": 2600, "maintenance": 330},
	"Ladesäule 43,6kW": { "acquisition": 15250, "maintenance": 1600},
	"Ladesäule 100 kW DC": { "acquisition": 48500, "maintenance": 4600}	
}

// Variables for oil prices
var oil_price_2014   = {"diesel": 1.217/1.19, "benzin":1.546/1.19} 		// € per L
var mineralölsteuer  = {"diesel": 0.4704, "benzin":0.6545} 		// € per L
var deckungsbeitrag  = {"diesel": 0.1563, "benzin":0.1227}		// € per L
var mehrwertsteuer   = 0										// No VAT for professionals
var price_per_barrel = {"2020": 117, "2030": 124, "2050": 128}	// In $-2011

//Variables for electricity prices in cents per kWh in 2011 €
var electricity_prices = {
	"2014": { "private": 29.13/1.19, "industrie": 13.49 },		// In 2014 - €
	"2020": { "private": 29.2/1.19, "industrie": 15.9 },		// In 2011 - €
	"2030": { "private": 28.4/1.19, "industrie": 15.7 },		// In 2011 - €
	"2050": { "private": 26.8/1.19, "industrie": 14.7/1.19 }	// In 2011 - €
}

// Variables for evolution of energy consumption in % of reduction per decade
var verbrauchsentwicklung = {
	"benzin":  {"2010": -.3,  "2020": -.12},
	"diesel":  {"2010": -.26, "2020": -.1},
	"LNF":     {"2010": -.14, "2020": -.1},
	"BEV":     {"2010": -.15, "2020": -.01},
	"BEV-LNF": {"2010": 0,    "2020": -.01}
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

// CO2 emission variables in kg per L or kg per kWh
var co2_emissions = {
	"strom_mix": {
		"2012": 0.623,
		"2020": 0.395,
		"2030": 0.248
	},
	"strom_erneubar": 0.012,
	"benzin": 2.80,
	"diesel": 3.15
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

// Returns the basis price for a vehicle
function getRawAcquisitionPrice(energy_type, car_type, year) {
	// Updates the starting prices with diesel
	var starting_price = nettolistenpreise;

	if (energy_type != "BEV") {
		for (type in starting_price["benzin"]) {
			if (energy_type != "benzin") {starting_price[energy_type][type] = {};}
			starting_price[energy_type][type]["2014"] = starting_price["benzin"][type]["2014"] + getPriceSurcharge(energy_type, type, year);
		}
		// Computes yearly price increase
		var yearly_increase = Math.pow((1 + kostensteigerung20102030[energy_type][car_type]), (1/20)) - 1;
		// Computes the value for the asked year
		return starting_price[energy_type][car_type]["2014"] * Math.pow(1+yearly_increase, year - 2014)
	} else { // Elektro car
		if (car_type.indexOf("LNF") > -1) {
			return getRawAcquisitionPrice("diesel", car_type, year) + getPriceSurcharge(energy_type, car_type, year);
		} else {
			return getRawAcquisitionPrice("benzin", car_type, year) + getPriceSurcharge(energy_type, car_type, year);
		}
	}
}

function getAcquisitionPrice(energy_type, car_type, year, option, scenario) {
	if (energy_type != "BEV") {
		return getRawAcquisitionPrice(energy_type, car_type, year);
	} else {
		var price = getRawAcquisitionPrice(energy_type, car_type, year);
		price += getBatteryPrice(car_type, year, scenario);
		price += getChargingOptionPrice(option, year)
		return price;
	}
}

function getChargingOptionPrice(option, year) {
	if (option == undefined) {return 0}
	// Decrease in price is 5%/year
	return lademöglichkeiten[option]["acquisition"] * Math.pow(1 - 0.05, year - 2014);
}

function getChargingOptionMaintenancePrice(option) {
	if (option == undefined) {return 0}
	return lademöglichkeiten[option]["maintenance"];
}

function getBatteryPrice(car_type, year, scenario) {
	return getNeededBatterySize(car_type, year) * getBatteryPricePerKWh (year, scenario);
}

// Returns the needed battery size
function getNeededBatterySize(car_type, year) {
	var capacity = reichweite * (getConsumption("BEV", car_type, year) / 100) / entladetiefe;
	var actual_capacity = capacity * entladetiefe;
	return actual_capacity;
}

// Returns the price of the battery in E/kwh
function getBatteryPricePerKWh (year, scenario) {
	for (var i = 2019; i<=2035; i++) {
		batteriepreise[i] = batteriepreise[i-1] - 5
	}
	if (scenario == "pro") { return batteriepreise[year] * 0.9}
	else if (scenario == "contra") { return batteriepreise[year] * 1.1}
	else { return batteriepreise[year]; }
}
 
// Returns the surcharge one has to pay for an electro vehicle in a given year (excl. battery)
function getPriceSurcharge(energy_type, car_type, year) {
	if (energy_type == "benzin") { return 0 }
	else if (energy_type != "BEV") {
		return aufpreis[energy_type][car_type]
	} else {
		var surcharge = aufpreis["BEV"];
		var surcharge_decrease_2020 = -.5;
		var yearly_surcharge_deacrease = Math.pow((1 + surcharge_decrease_2020), (1/6)) - 1;
		for (var i = 2015; i<=2020; i++){ // Automates the fill out of surcharge
			for (type in surcharge) {
				surcharge[type][i] = surcharge[type][i - 1] * (1 + yearly_surcharge_deacrease);
			}
		}
		for (var i = 2021; i<=2035; i++){ // Automates the fill out of surcharge
			for (type in surcharge) {
				surcharge[type][i] = surcharge[type]["2020"];
			}
		}
		return surcharge[car_type][year]
	}
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
	if (energy_type == "BEV") { return 0 }
	var lubricant_consumption = hubraum[energy_type][car_type] / 2000 * (0.5/1000);
	return price_of_lubricant * lubricant_consumption;
}

// Returns a cost in € 2014
function getLubricantCosts(energy_type, car_type, mileage) {
	return getLubricantConsumption(energy_type, car_type) * mileage;
}

// Returns a consumption in l/100km or kWh/100km
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

	// Because the information for electric cars is in kWh per km
	if (energy_type == "BEV") { consumption *= 100 }
	return consumption;
}

// Returns a price in € per L or € per kWh in € of the current_year
function getEnergyPrice(energy_type, estimation_year, scenario) {
	switch(energy_type) {
	    case "diesel":
	    case "benzin":
	        var estimates = {};
	        // Fills out the known prices
	        for (var year in price_per_barrel) {
	        	// Converts barrels to liters and to euros
	        	var ppb_eur = price_per_barrel[year] / exchange_rate
	        	var ppl_eur = ppb_eur / 158
	        	estimates[year] = getCurrentPrice(ppl_eur, 2011, 2014)
	        }
	        // Computes the price for 2040 to make it easier below
	        estimates["2040"] = estimates["2030"] + ((estimates["2050"] - estimates["2030"]) / 2)

	        if (estimation_year in estimates) { 
	        	price_per_l = estimates[estimation_year]
	        } else {
		        // Computes the price for all years
		        for (var year = 2014; year <2050; year++) {
			        if (year < 2020) {
			        	estimates[year] = oil_price_2014[energy_type] + ((getEnergyPrice(energy_type, 2020) - oil_price_2014[energy_type]) / 6) * (estimation_year - 2014)
			        } else if ((year % 10) != 0) {
			        	// Computes the linear growth rate of the price between 2 decades
			        	var decade_start = Math.floor(year / 10) * 10
			        	var decade_end = Math.ceil(year / 10) * 10
			        	estimates[year] = estimates[decade_start] + ((estimates[decade_end] - estimates[decade_start]) / 10) * (year - decade_start)
			        }
		        }
		        price_per_l = estimates[estimation_year]
	        }
	        
	        if (estimation_year >= 2020) {
		        price_per_l += mineralölsteuer[energy_type] + deckungsbeitrag[energy_type];
		        price_per_l *= (1 + mehrwertsteuer);
	        }
	        
	        if (scenario == "pro") { return price_per_l * 1.1; }
	        else if (scenario == "contra") {return price_per_l * .9;}
	        else {return price_per_l;}
	        break;
	    case "BEV":
	    	var estimates = {};
	    	// Fills out the known prices
	        for (var year in electricity_prices) {
	        	if (year != "2014"){
		        	if (scenario == "pro") { estimates[year] = electricity_prices[year]["private"] * .9; }
		        	else if (scenario == "contra") {estimates[year] = electricity_prices[year]["private"] * 1.1;}
		        	else { estimates[year] = electricity_prices[year]["private"]; }
		        	estimates[year] = getCurrentPrice(estimates[year], 2011, 2014)
	        	} else {
	        		estimates[year] = electricity_prices[year]["private"]
	        	}
	        }
	        // Computes the price for 2040 to make it easier below
	        estimates["2040"] = estimates["2030"] + ((estimates["2050"] - estimates["2030"]) / 2)
	        if (estimation_year in estimates) { 
	        	estimates[year] = estimates[estimation_year]
	        } else {
		        // Computes the price for all years
		        for (var year = 2014; year <2050; year++) {
			        if (year < 2020) {
			        	estimates[year] = estimates["2014"] + ((estimates["2020"] - estimates["2014"]) / 6) * (estimation_year - 2014)
			        } else if ((year % 10) != 0) {
			        	// Computes the linear growth rate of the price between 2 decades
			        	var decade_start = Math.floor(year / 10) * 10
			        	var decade_end = Math.ceil(year / 10) * 10
			        	estimates[year] = estimates[decade_start] + ((estimates[decade_end] - estimates[decade_start]) / 10) * (year - decade_start)
			        }
		        }
	        }

	        // divides by 100 as we were in cents till then
	        return estimates[estimation_year] / 100

	    	break;
	}
}

function getEnergyCosts(energy_type, car_type, mileage, year, acquisition_year, scenario){
	return (mileage / 100) * getConsumption(energy_type, car_type, acquisition_year) * getEnergyPrice(energy_type, year, scenario);
}

// Returns the estimated kg of CO2 per kWh based on the data points we have
function getCO2FromElectricityMix(estimation_year) {
	var estimates = {}
	for (var year in co2_emissions["strom_mix"]){
		estimates[year] = co2_emissions["strom_mix"][year];
	}
	if (estimation_year in co2_emissions["strom_mix"]){
		return estimates[estimation_year]
	} else {
		for (var year = 2012; year<=2050; year++){
			 if (year < 2020) {
			    estimates[year] = estimates["2012"] + ((estimates["2020"] - estimates["2012"]) / 8) * (estimation_year - 2012)
			} else {
				var decade_start = Math.floor(year / 10) * 10
				var decade_end = Math.ceil(year / 10) * 10
				estimates[year] = estimates[decade_start] + ((estimates[decade_end] - estimates[decade_start]) / 10) * (year - decade_start)
			}
		}
		return estimates[estimation_year]
	}
}

function getTCOByHoldingTime(energy_type, car_type, acquisition_year, mileage, charging_option) {
	var TCO = {};
	var scenarios = ["contra", "mittel", "pro"];
	for (scen_num in scenarios) {
		var scenario = scenarios[scen_num];
		TCO[scenario] = {};
		var acquisition_costs = getAcquisitionPrice(energy_type, car_type, acquisition_year, charging_option, scenario);
		var amortization = (1 / abschreibungszeitraum) * unternehmenssteuersatz * acquisition_costs;

		for (var year=acquisition_year; year <= 2025; year++) {
			TCO[scenario][year] = {}
			fixed_costs = getFixedCosts(energy_type, car_type);
			if (charging_option != undefined) { fixed_costs += getChargingOptionMaintenancePrice(charging_option) }

			energy_costs = getEnergyCosts(energy_type, car_type, mileage, year, acquisition_year, scenario)
			variable_costs = getMaintenanceCosts(energy_type, car_type, mileage) + getLubricantCosts(energy_type, car_type, mileage)

			if (year == acquisition_year) { 
				TCO[scenario][year]["fixed_costs"] = fixed_costs
				TCO[scenario][year]["energy_costs"] = energy_costs
				TCO[scenario][year]["variable_costs"] = variable_costs
				//takes into account amortization, including special case of sonder afa
				if (sonder_afa == true && energy_type=="BEV") { amortization = acquisition_costs * .5 * unternehmenssteuersatz; }
				TCO[scenario][year]["vehicle_value"] = acquisition_costs - amortization;
			} else { 
				TCO[scenario][year]["fixed_costs"] = TCO[scenario][year - 1]["fixed_costs"] + fixed_costs
				TCO[scenario][year]["energy_costs"] = TCO[scenario][year - 1]["energy_costs"] + energy_costs
				TCO[scenario][year]["variable_costs"] = TCO[scenario][year - 1]["variable_costs"] + variable_costs
				// if sonder_afa is true, then only half the vehicle value is amortized
				if (sonder_afa == true && energy_type=="BEV") { amortization = (1 / abschreibungszeitraum) * unternehmenssteuersatz * acquisition_costs * .5 }
				// amortization stops when amortization period ends
				if ((year - acquisition_year) > abschreibungszeitraum) {amortization = 0;}
				TCO[scenario][year]["vehicle_value"] = TCO[scenario][year - 1]["vehicle_value"] - amortization;
			}
		}
	}
	return TCO;
}

function getTCOByMileage(energy_type, car_type, acquisition_year, year, charging_option) {
	var TCO = {};
	var scenarios = ["contra", "mittel", "pro"];
	for (scen_num in scenarios) {
		var scenario = scenarios[scen_num];
		TCO[scenario] = {};
		var acquisition_costs = getAcquisitionPrice(energy_type, car_type, acquisition_year, charging_option, scenario);
		var amortization = ((year - acquisition_year + 1) / abschreibungszeitraum) * unternehmenssteuersatz * acquisition_costs;
		if (sonder_afa == true && energy_type=="BEV") {
			if (year == acquisition_year) { amortization = acquisition_costs * .5 * unternehmenssteuersatz;}
			else { amortization = (1 / abschreibungszeitraum) * unternehmenssteuersatz * acquisition_costs * .5 }
		}
		if ((year - acquisition_year) > abschreibungszeitraum) {amortization = acquisition_costs;}
		for (var mileage=0; mileage <= 100000; mileage+=10000) {
			TCO[scenario][mileage] = {}
			fixed_costs = getFixedCosts(energy_type, car_type);
			if (charging_option != undefined) { fixed_costs += getChargingOptionMaintenancePrice(charging_option) }

			energy_costs = getEnergyCosts(energy_type, car_type, mileage, year, acquisition_year, scenario)
			variable_costs = getMaintenanceCosts(energy_type, car_type, mileage) + getLubricantCosts(energy_type, car_type, mileage)

			TCO[scenario][mileage]["fixed_costs"] = fixed_costs
			TCO[scenario][mileage]["energy_costs"] = energy_costs
			TCO[scenario][mileage]["variable_costs"] = variable_costs
			TCO[scenario][mileage]["vehicle_value"] = acquisition_costs - amortization;
		}
	}
	return TCO;
}

function getCO2byMileage(car_type, acquisition_year, year) {
	var CO2 = {};
	for (var mileage=0; mileage <= 100000; mileage+=10000) {
		CO2[mileage] = {};
		CO2[mileage]["strom_mix"] = (mileage / 100) * getConsumption("BEV", car_type, acquisition_year) * getCO2FromElectricityMix(year)
		CO2[mileage]["strom_erneubar"] = (mileage / 100) * getConsumption("BEV", car_type, acquisition_year) * co2_emissions["strom_erneubar"]
		CO2[mileage]["benzin"] = (mileage / 100) * getConsumption("benzin", car_type, acquisition_year) * co2_emissions["benzin"]
		CO2[mileage]["diesel"] = (mileage / 100) * getConsumption("diesel", car_type, acquisition_year) * co2_emissions["diesel"]
	}
	return CO2;
}

// Returns the total amount of CO2 emitted
function getTCO2byHoldingTime(car_type, acquisition_year, mileage) {
	var CO2 = {};
	for (var year=acquisition_year; year <= 2025; year++) {
		CO2[year] = {};
		CO2[year]["strom_mix"] = (mileage / 100) * getConsumption("BEV", car_type, acquisition_year) * getCO2FromElectricityMix(year)
		CO2[year]["strom_erneubar"] = (mileage / 100) * getConsumption("BEV", car_type, acquisition_year) * co2_emissions["strom_erneubar"]
		CO2[year]["benzin"] = (mileage / 100) * getConsumption("benzin", car_type, acquisition_year) * co2_emissions["benzin"]
		CO2[year]["diesel"] = (mileage / 100) * getConsumption("diesel", car_type, acquisition_year) * co2_emissions["diesel"]

		if (year > acquisition_year) {
			CO2[year]["strom_mix"] += CO2[year - 1]["strom_mix"]
			CO2[year]["strom_erneubar"] += CO2[year - 1]["strom_erneubar"]
			CO2[year]["benzin"] += CO2[year - 1]["benzin"]
			CO2[year]["diesel"] += CO2[year - 1]["diesel"]
		}
	}
	return CO2;
}

// console.log(getCurrentPrice(0.5924050633, 2011, 2014) + " --- Should be 0.6231342472")
// console.log(getEnergyPrice("benzin", 2045) + " --- Should NOT be 1.46")	
// console.log(getEnergyPrice("benzin", 2050) + " --- Should be 1.46")				
// console.log(getEnergyPrice("benzin", 2014) + " --- Should be 1.30")
// console.log(getEnergyPrice("BEV", 2032, "contra") + " --- Should be 27.54")			
// console.log(getEnergyPrice("BEV", 2032, "pro") + " --- Should be 22.53")		
// console.log(getConsumption("benzin", "klein", 2014) + " --- Should be 6.94")
// console.log(getConsumption("BEV", "klein", 2020) + " --- Should be 13")			
// console.log(getLubricantConsumption("benzin", "klein") + " --- Should be 0.0023")			
// console.log(getFixedCosts("benzin", "mittel") + " --- Should be 1039")					
// console.log(getMaintenanceCosts("benzin", "mittel", 15000) + " --- Should be 603")		
// console.log(getLubricantCosts("benzin", "mittel", 15000) + " --- Should be 41.3")		
// console.log(getEnergyCosts("benzin", "mittel", 15000, 2014, 2014) + " --- Should be 1574.61")	
console.log(getEnergyCosts("BEV", "mittel", 15000, 2014, 2014) + " --- Should be 697")	
// console.log(getPriceSurcharge("BEV", "klein", "2021") + " --- Should be 750")
// console.log(getPriceSurcharge("BEV", "mittel", "2014") + " --- Should be 2000")						
// console.log(getBatteryPricePerKWh("2019", "contra") + " --- Should be 313.5")	
// console.log(getRawAcquisitionPrice("diesel", "LNF1", "2016") + " --- Price of a LNF1 diesel in 2016: 20,366€")
// console.log(getAcquisitionPrice("BEV", "mittel", "2014") + " --- New electric mittel costs in 2014: 29,682€")
// console.log(getChargingOptionPrice("Wallbox bis 22kW", 2022) + " --- Should be 531")
// console.log(getCO2FromElectricityMix("2021") + " --- Should be .380")
console.log(getTCOByMileage("BEV", "mittel", "2015", "2017"))
//console.log(getTCOByHoldingTime("benzin", "mittel", 2015, "15000"))
//console.log(getCO2byMileage("mittel", 2014, 2018))
//console.log(getTCO2byHoldingTime("mittel", 2018, 15000))