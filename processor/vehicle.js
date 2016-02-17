var presets = require('./presets');
var scenarios = ["pro", "mittel", "contra"]

// Corrects amounts for inflation
function getCurrentPrice(amount, originalYear, wishedYear){
	return amount * Math.pow(1+presets.inflationsrate, wishedYear - originalYear)
}

// Returns the basis price for all vehicles
function getRawAcquisitionPrice(energy_type, car_type, year) {
	// Updates the starting prices with diesel
	var starting_price = presets.nettolistenpreise;

	if (energy_type != "BEV") {
		for (type in starting_price["benzin"]) {
			if (energy_type != "benzin") {starting_price[energy_type][type] = {};}
			starting_price[energy_type][type]["2014"] = starting_price["benzin"][type]["2014"] + getPriceSurcharge(energy_type, type, year);
		}
		// Computes yearly price increase
		var yearly_increase = Math.pow((1 + presets.kostensteigerung20102030[energy_type][car_type]), (1/20)) - 1;
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

// Returns the surcharge one has to pay for an electro vehicle in a given year (excl. battery)
function getPriceSurcharge(energy_type, car_type, year) {
	if (energy_type == "benzin") { return 0 }
	else if (energy_type != "BEV") {
		return presets.aufpreis[energy_type][car_type]
	} else {
		var surcharge = presets.aufpreis["BEV"];
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

function getChargingOptionPrice(option, year) {
	if (option == undefined) {return 0}
	// Decrease in price is 5%/year
	return presets.lademöglichkeiten[option]["acquisition"] * Math.pow(1 - 0.05, year - 2014);
}

function getChargingOptionMaintenancePrice(option) {
	if (option == undefined) {return 0}
	return presets.lademöglichkeiten[option]["maintenance"];
}

// Returns the price of the battery in E/kwh
function getBatteryPricePerKWh (year, scenario) {
	for (var i = 2019; i<=2035; i++) {
		presets.batteriepreise[i] = presets.batteriepreise[i-1] - 5
	}
	if (scenario == "pro") { return presets.batteriepreise[year] * 0.9}
	else if (scenario == "contra") { return presets.batteriepreise[year] * 1.1}
	else { return presets.batteriepreise[year]; }
}

function getEnergyPrice(energy_type, estimation_year, scenario) {
	switch(energy_type) {
	    case "diesel":
	    case "benzin":
	        var estimates = {};
	        // Fills out the known prices
	        for (var year in presets.price_per_barrel) {
	        	// Converts barrels to liters and to euros
	        	var ppb_eur = presets.price_per_barrel[year] / presets.exchange_rate
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
			        	estimates[year] = presets.oil_price_2014[energy_type] + ((getEnergyPrice(energy_type, 2020) - presets.oil_price_2014[energy_type]) / 6) * (estimation_year - 2014)
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
		        price_per_l += presets.mineralölsteuer[energy_type] + presets.deckungsbeitrag[energy_type];
		        price_per_l *= (1 + presets.mehrwertsteuer);
	        }

	        if (scenario == "pro") { return price_per_l * 1.1; }
	        else if (scenario == "contra") {return price_per_l * .9;}
	        else {return price_per_l;}
	        break;
	    case "BEV":
	    	var estimates = {};
	    	// Fills out the known prices
	        for (var year in presets.electricity_prices) {
	        	if (year != "2014"){
		        	if (scenario == "pro") { estimates[year] = presets.electricity_prices[year]["private"] * .9; }
		        	else if (scenario == "contra") {estimates[year] = presets.electricity_prices[year]["private"] * 1.1;}
		        	else { estimates[year] = presets.electricity_prices[year]["private"]; }
		        	estimates[year] = getCurrentPrice(estimates[year], 2011, 2014)
	        	} else {
	        		estimates[year] = presets.electricity_prices[year]["private"]
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

// Returns the estimated kg of CO2 per kWh based on the data points we have
function getCO2FromElectricityMix(estimation_year) {
	var estimates = {}
	for (var year in presets.co2_emissions["strom_mix"]){
		estimates[year] = presets.co2_emissions["strom_mix"][year];
	}
	if (estimation_year in presets.co2_emissions["strom_mix"]){
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

var Vehicle = function(params) {
	this.energy_type = "BEV";
	this.car_type = "klein";
	this.mileage = 20000;
	this.acquisition_year = 2014;
	this.reichweite = 150;
	this.energy_source = "strom_mix"; //can also be "strom_erneubar"
	this.charging_option = undefined;
	this.maintenance_costs_charger = 0;
	this.fleet_size = 1;
	this.traffic = "normaler Verkehr"
	this.training_option = "keine Schulung"

	for(var prop in params) {
    if( params.hasOwnProperty(prop) && this.hasOwnProperty(prop) ) {
			this[prop] = params[prop];
		}
	}

	this.price = {};
	this.maintenance_costs_total = this.maintenance_costs_repairs = this.maintenance_costs_tires = this.maintenance_costs_inspection = 0;
	this.fixed_costs = {};
	this.energy_prices = {};
	this.energy_costs = {};
	this.TCO = {};
	this.TCO_by_mileage = {};
	this.amortization = {};
	this.CO2 = {}
	this.CO2_by_mileage = {};

	this.getMaintenanceCosts = function(){
		if (this.energy_type =="BEV" && this.charging_option != undefined) {
			this.maintenance_costs_charger = presets.lademöglichkeiten[this.charging_option]["maintenance"] / this.fleet_size;
		}
		if (this.energy_type == "BEV" && this.car_type.indexOf("LNF") == -1) {
			this.maintenance_costs_tires = presets.reperaturkosten["benzin"][this.car_type]["reifen"] ;
			this.maintenance_costs_inspection = presets.reperaturkosten["benzin"][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten["benzin"][this.car_type]["reparatur"] * presets.faktor_BEV;
		} else if (this.energy_type == "BEV" && this.car_type.indexOf("LNF") == -1) {
			this.maintenance_costs_tires = presets.reperaturkosten["diesel"][this.car_type]["reifen"];
			this.maintenance_costs_inspection = presets.reperaturkosten["diesel"][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten["diesel"][this.car_type]["reparatur"] * presets.faktor_BEV;
		} else {
			this.maintenance_costs_tires = presets.reperaturkosten[this.energy_type][this.car_type]["reifen"];
			this.maintenance_costs_inspection = presets.reperaturkosten[this.energy_type][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten[this.energy_type][this.car_type]["reparatur"];
		}
		this.maintenance_costs_tires = ((this.maintenance_costs_tires * 12) / 20000) * this.mileage * this.traffic_multiplicator;
		this.maintenance_costs_inspection = ((this.maintenance_costs_inspection * 12) / 20000) * this.mileage * this.traffic_multiplicator;
		this.maintenance_costs_repairs = ((this.maintenance_costs_repairs * 12) / 20000) * this.mileage * this.traffic_multiplicator;

		this.maintenance_costs_total = this.maintenance_costs_tires + this.maintenance_costs_inspection + this.maintenance_costs_repairs + this.maintenance_costs_charger;

	}

	this.getAcquisitionPrice = function() {
		this.price.total = {}
		this.price.battery_price = {}
		for (var i in scenarios) {
			var scenario = scenarios[i];
			if (this.energy_type != "BEV") {
				this.price.basis_price = getRawAcquisitionPrice(this.energy_type, this.car_type, this.acquisition_year);
				this.price.total[scenario] = this.price.basis_price;
			} else {
				this.price.basis_price = getRawAcquisitionPrice(this.energy_type, this.car_type, this.acquisition_year);
				this.price.battery_price[scenario] = this.getBatteryPrice(scenario);
				this.price.charging_option = getChargingOptionPrice(this.charging_option, this.acquisition_year) / this.fleet_size;
				this.price.total[scenario] = this.price.basis_price + this.price.battery_price[scenario] + this.price.charging_option;
			}
		}
	}

	this.setAcquisitionPrice = function(price) {
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.price.total[scenario] = price;
		}
	}

	this.getBatteryPrice = function(scenario) {
		return this.getNeededBatterySize() * getBatteryPricePerKWh(this.acquisition_year, scenario);
	}

	this.getNeededBatterySize = function() {
		var capacity = this.reichweite * (this.fuel_consumption / 100) / presets.entladetiefe;
		var actual_capacity = capacity * presets.entladetiefe;
		return actual_capacity;
	}

	this.getFixedCosts = function() {
		this.fixed_costs.car_tax = presets.kfzsteuer[this.energy_type][this.car_type];
		this.fixed_costs.check_up = presets.untersuchung[this.energy_type]["AU"] + presets.untersuchung[this.energy_type]["HU"]
		this.fixed_costs.insurance = presets.versicherung[this.energy_type][this.car_type];
		this.fixed_costs.total = this.fixed_costs.car_tax + this.fixed_costs.check_up + this.fixed_costs.insurance;
	}

	this.getLubricantConsumption = function() {
		if (this.energy_type == "BEV") { return 0 }
		var lubricant_consumption = presets.hubraum[this.energy_type][this.car_type] / 2000 * (0.5/1000);
		return presets.price_of_lubricant * lubricant_consumption;
	}

	this.getLubricantCosts = function() {
		this.lubricant_costs = this.getLubricantConsumption() * this.mileage;
	}

	this.getConsumption = function() {
		this.fuel_consumption = presets.verbrauch[this.energy_type][this.car_type];
		var improvement_first_decade = presets.verbrauchsentwicklung[this.energy_type]["2010"];
		var yearly_improvement_first_decade = Math.pow((1 + improvement_first_decade), (1/10)) - 1;
		var improvement_second_decade = presets.verbrauchsentwicklung[this.energy_type]["2020"];
		var yearly_improvement_second_decade = Math.pow(1 + improvement_second_decade, .1) - 1;

		// Need to take into account the rate of improvement of the previous decade
		if (this.acquisition_year > 2020) {
			this.fuel_consumption *= Math.pow(1+yearly_improvement_first_decade, this.acquisition_year - 2014);
			this.fuel_consumption *= Math.pow(1+yearly_improvement_second_decade, this.acquisition_year - 2020);
		} else {
			this.fuel_consumption *= Math.pow(1+yearly_improvement_first_decade, this.acquisition_year - 2014);
		}

		// Because the information for electric cars is in kWh per km
		if (this.energy_type == "BEV") { this.fuel_consumption *= 100 }

	}

	this.getEnergyPrices = function() {
		for (var year = this.acquisition_year; year <= 2025; year++) {
			this.energy_prices[year] = {}
			this.energy_prices[year]["pro"] = getEnergyPrice(this.energy_type, year, "pro");
			this.energy_prices[year]["mittel"] = getEnergyPrice(this.energy_type, year, "mittel");
			this.energy_prices[year]["contra"] = getEnergyPrice(this.energy_type, year, "contra");
		}
	}

	this.setEnergyPrices = function(new_price) {
		for (var year = this.acquisition_year; year <= 2025; year++) {
			this.energy_prices[year]["pro"] = new_price;
			this.energy_prices[year]["mittel"] = new_price;
			this.energy_prices[year]["contra"] = new_price;
		}
	}

	this.getEnergyCosts = function(){
		for (var year = this.acquisition_year; year <= 2025; year++) {
			this.energy_costs[year] = {}
			this.energy_costs[year]["pro"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[year]["pro"];
			this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[year]["mittel"];
			this.energy_costs[year]["contra"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[year]["contra"];
		}
	}

	this.getAmortization = function() {
		for (var i in scenarios) {
			this.amortization[scenarios[i]] = {}
			var scenario = scenarios[i];
			for (var year = this.acquisition_year; year <= 2025; year++) {
				if (year < this.acquisition_year + presets.abschreibungszeitraum){
					if (year == this.acquisition_year && presets.sonder_afa == true && this.energy_type=="BEV"){
						this.amortization[scenario][year] = this.price.total[scenario] * .5 * presets.unternehmenssteuersatz;
					} else if (presets.sonder_afa == true && this.energy_type=="BEV") {
						this.amortization[scenario][year] = (1 / presets.abschreibungszeitraum) * presets.unternehmenssteuersatz * this.price.total[scenario] * .5
					} else {
						//Normal amortization
						this.amortization[scenario][year] = (1 / presets.abschreibungszeitraum) * presets.unternehmenssteuersatz * this.price.total[scenario]
					}
				} else {
					this.amortization[scenario][year] = 0;
				}
			}
		}
	}

	this.getTCOByHoldingTime = function() {
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.TCO[scenario] = {};

			for (var year=this.acquisition_year; year <= 2025; year++) {

				this.TCO[scenario][year] = {}

				if (year == this.acquisition_year) {
					this.TCO[scenario][year]["fixed_costs"] = this.fixed_costs
					this.TCO[scenario][year]["energy_costs"] = this.energy_costs[year][scenario]
					this.TCO[scenario][year]["training_costs"] = this.training_costs
					this.TCO[scenario][year]["variable_costs"] = {
						"lubricant_costs": this.lubricant_costs,
						"maintenance_costs": this.maintenance_costs_total
					}
					this.TCO[scenario][year]["residual_vehicle_value"] = this.price.total[scenario] - this.amortization[scenario][year];
					this.TCO[scenario][year]["total_cost"] = this.fixed_costs.total + this.energy_costs[year][scenario] + this.lubricant_costs + this.maintenance_costs_total + this.price.total[scenario] - this.amortization[scenario][year]

				} else {
					this.TCO[scenario][year]["fixed_costs"] = {}
					this.TCO[scenario][year]["variable_costs"] = {}
					this.TCO[scenario][year]["training_costs"] = this.training_costs
					this.TCO[scenario][year]["fixed_costs"]["car_tax"] = this.TCO[scenario][year - 1]["fixed_costs"]["car_tax"] + this.fixed_costs.car_tax
					this.TCO[scenario][year]["fixed_costs"]["check_up"] = this.TCO[scenario][year - 1]["fixed_costs"]["check_up"] + this.fixed_costs.check_up
					this.TCO[scenario][year]["fixed_costs"]["insurance"] = this.TCO[scenario][year - 1]["fixed_costs"]["insurance"] + this.fixed_costs.insurance
					this.TCO[scenario][year]["fixed_costs"]["total"] = this.TCO[scenario][year - 1]["fixed_costs"]["total"] + this.fixed_costs.total
					this.TCO[scenario][year]["variable_costs"]["lubricant_costs"] = this.TCO[scenario][year - 1]["variable_costs"]["lubricant_costs"] + this.lubricant_costs
					this.TCO[scenario][year]["variable_costs"]["maintenance_costs"] = this.TCO[scenario][year - 1]["variable_costs"]["maintenance_costs"] + this.maintenance_costs_total
					this.TCO[scenario][year]["energy_costs"] = this.TCO[scenario][year - 1]["energy_costs"] + this.energy_costs[year][scenario]
					this.TCO[scenario][year]["residual_vehicle_value"] = this.TCO[scenario][year - 1]["residual_vehicle_value"] - this.amortization[scenario][year];
					this.TCO[scenario][year]["total_cost"] = this.TCO[scenario][year - 1]["total_cost"] + this.fixed_costs.total + this.energy_costs[year][scenario] + this.lubricant_costs + this.maintenance_costs_total - this.amortization[scenario][year]
				}
			}
		}
	}

	// This function is for one year only. Otherwise, it's too long to compute
	this.getTCOByMileage = function(year) {
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.TCO_by_mileage[scenario] = {};

			// this.TCO_by_mileage[scenario][year] = {}

			// Saves the initial value
			var temp_mileage = this.mileage;

			for (var miles=0; miles <= 100000; miles+=10000) {

				// Updates the energy costs for the new mileage
				this.mileage = miles;
				this.computeCosts();
				// this.TCO_by_mileage[scenario][year][miles] = this.TCO[scenario][year]
				this.TCO_by_mileage[scenario][miles] = this.TCO[scenario][year]

			}
			// Goes back to original position
			this.mileage = temp_mileage;
			this.computeCosts();

		}
	}

	this.getTCO2byHoldingTime = function() {

		if (this.energy_type != "BEV") {
			this.energy_source = this.energy_type;
		}

		for (var year=this.acquisition_year; year <= 2025; year++) {
			this.CO2[year] = {};

			if (this.energy_source == "strom_mix") {
				this.CO2[year] = (this.mileage / 100) * this.fuel_consumption * getCO2FromElectricityMix(year)
			} else {
				this.CO2[year] = (this.mileage / 100) * this.fuel_consumption * presets.co2_emissions[this.energy_source]
			}

			if (year > this.acquisition_year) {
				this.CO2[year] += this.CO2[year - 1]
			}
		}
	}

	this.getTrainingCosts = function() {
		// Decrease in price is 5%/year
		this.training_costs = presets.schulungskosten[this.training_option] * Math.pow(1 - 0.05, this.acquisition_year - 2014) / this.fleet_size;
	}

	this.getCO2byMileage = function(year) {
		// Saves the initial value
		var temp_mileage = this.mileage;

		for (var miles=0; miles <= 100000; miles+=10000) {

			// Updates the energy costs for the new mileage
			this.mileage = miles;
			this.computeCosts();
			this.CO2_by_mileage[miles] = this.CO2[year]

		}
		// Goes back to original position
		this.mileage = temp_mileage;
		this.computeCosts();
	}

	this.computeCosts = function() {
		this.traffic_multiplicator = presets.traffic_multiplicator[this.traffic];
		this.getFixedCosts();
		this.getAcquisitionPrice();
		this.getMaintenanceCosts();
		this.getLubricantCosts();
		this.getConsumption();
		this.getEnergyPrices();
		this.getEnergyCosts();
		this.getAmortization();
		this.getTrainingCosts();
		this.getTCOByHoldingTime();
		this.getTCO2byHoldingTime();
	}

	this.computeCosts();
	this.getTCOByMileage(this.acquisition_year);
	this.getCO2byMileage(this.acquisition_year);

}

module.exports = Vehicle
// Static object within the Vehicle class containing all presets
module.exports.presets = presets
