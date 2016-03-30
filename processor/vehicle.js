var presets = require('./presets');
var extend = require("xtend")
var scenarios = ["pro", "mittel", "contra"]

// Corrects amounts for inflation
function getCurrentPrice(amount, originalYear, wishedYear){
	return amount * Math.pow(1+presets.inflationsrate, wishedYear - originalYear)
}

// Returns the basis price for all vehicles
function getRawAcquisitionPrice(energy_type, car_type, year) {
	// Updates the starting prices with diesel
	var starting_price = presets.nettolistenpreise;

	if (energy_type != "BEV" && energy_type.indexOf("hybrid") == -1) {
		for (type in starting_price["benzin"]) {
			if (energy_type != "benzin") {starting_price[energy_type][type] = {};}
			starting_price[energy_type][type]["2014"] = starting_price["benzin"][type]["2014"] + getPriceSurcharge(energy_type, type, year);
		}
		// Computes yearly price increase
		var yearly_increase = Math.pow((1 + presets.kostensteigerung20102030[energy_type][car_type]), (1/20)) - 1;
		// Computes the value for the asked year
		return starting_price[energy_type][car_type]["2014"] * Math.pow(1+yearly_increase, year - 2014)
	
	} else if (energy_type.indexOf("hybrid") > -1) { // hybrid car
		if (energy_type.indexOf("diesel") > -1) { //hybrid-diesel
			return getRawAcquisitionPrice("diesel", car_type, year) + getPriceSurcharge("hybrid", car_type, year);
		} else {
			return getRawAcquisitionPrice("benzin", car_type, year) + getPriceSurcharge("hybrid", car_type, year);
		}
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
	else if (energy_type == "diesel") {
		return presets.aufpreis[energy_type][car_type]
	} else if (energy_type == "BEV") {
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
	} else {
		return presets.aufpreis["hybrid"][car_type]
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

function getEnergyPrice() {
	var estimates = {};
	var energy_types = ["diesel", "benzin"]
	for (var energy_type_index in energy_types) {  
		energy_type = energy_types[energy_type_index]
		estimates[energy_type] = {}

	    // Fills out the known prices
	    for (var year in presets.price_per_barrel) {
	    	estimates[energy_type][year] = {}
	    	// Converts barrels to liters and to euros
	    	var ppb_eur = presets.price_per_barrel[year] / presets.exchange_rate
	    	var ppl_eur = ppb_eur / 158
	    	estimates[energy_type][year]["mittel"] = getCurrentPrice(ppl_eur, 2011, 2014)
	    	estimates[energy_type][year]["mittel"] += presets.mineralölsteuer[energy_type] + presets.deckungsbeitrag[energy_type]
	    }
	    // Computes the price for 2040 to make it easier below
	    estimates[energy_type]["2040"] = {}
	    estimates[energy_type]["2040"]["mittel"] = estimates[energy_type]["2030"]["mittel"] + ((estimates[energy_type]["2050"]["mittel"] - estimates[energy_type]["2030"]["mittel"]) / 2)

        for (var year = 2014; year <2050; year++) {
        	if (!(year in estimates[energy_type])){
        		estimates[energy_type][year] = {}
		        if (year < 2020) {
		        	estimates[energy_type][year]["mittel"] = presets.oil_price_2014[energy_type] + ((estimates[energy_type]["2020"]["mittel"] - presets.oil_price_2014[energy_type]) / 6) * (year - 2014)
		        } else if ((year % 10) != 0) {
		        	// Computes the linear growth rate of the price between 2 decades
		        	var decade_start = Math.floor(year / 10) * 10
		        	var decade_end = Math.ceil(year / 10) * 10
		        	estimates[energy_type][year]["mittel"] = estimates[energy_type][decade_start]["mittel"] + ((estimates[energy_type][decade_end]["mittel"] - estimates[energy_type][decade_start]["mittel"]) / 10) * (year - decade_start)
		        }
		    }

	    	estimates[energy_type][year]["pro"] = estimates[energy_type][year]["mittel"] * 1.1
	    	estimates[energy_type][year]["contra"] = estimates[energy_type][year]["mittel"] * .9

        }
	}
	
	//Computes electricity prices
	energy_type = "BEV"
	estimates[energy_type] = {}
    for (var year in presets.electricity_prices) {
    	estimates[energy_type][year] = {}
    	if (year != "2014"){
        	estimates[energy_type][year]["pro"] = presets.electricity_prices[year]["private"] * .9
        	estimates[energy_type][year]["contra"] = presets.electricity_prices[year]["private"] * 1.1
        	estimates[energy_type][year]["mittel"] = presets.electricity_prices[year]["private"]
        	estimates[energy_type][year]["mittel"] = getCurrentPrice(estimates[energy_type][year]["mittel"], 2011, 2014)
    	} else {
    		estimates[energy_type][year]["mittel"] = presets.electricity_prices[year]["private"]
    	}
    }
    // Computes the price for 2040 to make it easier below
    estimates[energy_type]["2040"] = {}
    estimates[energy_type]["2040"]["mittel"] = estimates[energy_type]["2030"]["mittel"] + ((estimates[energy_type]["2050"]["mittel"] - estimates[energy_type]["2030"]["mittel"]) / 2)
  
    for (var year = 2014; year <2050; year++) {
    	if (!(year in estimates[energy_type])){
    		estimates[energy_type][year] = {}
    		
	        if (year < 2020) {
	        	estimates[energy_type][year]["mittel"] = estimates[energy_type]["2014"]["mittel"] + ((estimates[energy_type]["2020"]["mittel"] - estimates[energy_type]["2014"]["mittel"]) / 6) * (year - 2014)
	        } else if ((year % 10) != 0) {
	        	// Computes the linear growth rate of the price between 2 decades
	        	var decade_start = Math.floor(year / 10) * 10
	        	var decade_end = Math.ceil(year / 10) * 10
	        	estimates[energy_type][year]["mittel"] = estimates[energy_type][decade_start]["mittel"] + ((estimates[energy_type][decade_end]["mittel"] - estimates[energy_type][decade_start]["mittel"]) / 10) * (year - decade_start)
	        }
    	}

    	estimates[energy_type][year]["pro"] = estimates[energy_type][year]["mittel"] * 1.1
	    estimates[energy_type][year]["contra"] = estimates[energy_type][year]["mittel"] * .9
	}

	return estimates
	
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
	this.energy_type = "BEV"
	this.car_type = "klein"
	this.electricity_consumption = 0
	this.mileage = 20000
	this.acquisition_year = 2014
	this.holding_time = 4
	this.reichweite = 150
	this.energy_source = "strom_mix"
	this.charging_option = undefined
	this.maintenance_costs_charger = 0
	this.fleet_size = 1
	this.traffic = "normaler Verkehr"
	this.training_option = "keine Schulung"
	this.share_electric = 55
	this.second_charge = false
	this.residual_value_method = "Methode 1"
	this.second_user_holding_time = 6
	this.second_user_yearly_mileage = 20000
	this.max_battery_charges = 2500

	for(var prop in params) {
    if( params.hasOwnProperty(prop) && this.hasOwnProperty(prop) ) {
			this[prop] = params[prop]
		}
	}

	this.charges_per_year = this.mileage / this.reichweite
	this.battery_duration = this.max_battery_charges / this.charges_per_year
	this.fixed_vars = {}
	this.residual_value = {}
	this.price = {}
	this.maintenance_costs_total = this.maintenance_costs_repairs = this.maintenance_costs_tires = this.maintenance_costs_inspection = 0
	this.fixed_costs = {}
	this.energy_prices = {}
	this.energy_costs = {}
	this.amortization = {}

	this.TCO_by_holding_time = {}
	this.TCO_by_acquisition_year = {}
	this.TCO_by_mileage = {}
	
	
	this.getResidualValue = function(method){
		if (method == "Methode 1"){
			for (var year = this.acquisition_year; year <= 2035; year++) {
				this.residual_value[year] = Math.exp(presets.restwert_constants["a"]) 										  // Constant
				this.residual_value[year] *= Math.exp(12 * presets.restwert_constants["b1"] * (year - this.acquisition_year + 1)) // Age
				this.residual_value[year] *= Math.exp(presets.restwert_constants["b2"] /12 * this.mileage)						  // Yearly mileage
				this.residual_value[year] *= Math.pow(this.price.total["mittel"], presets.restwert_constants["b3"])				  // Initial price
			} 
		} else if (method == "Methode 2"){
			// Computes residual value with Method 1
			this.getResidualValue("Methode 1")
			// Computes the advantage of the 2d user
			var advantage_2d_user = 0
			for (var year = this.acquisition_year; year <= 2035; year++) {
				for (var year2 = year; year2 <= year + this.second_user_holding_time; year2++) {
					if (year2 <= 2025){
						//computes consumption
						var elec_consumption = this.second_user_yearly_mileage * (this.electricity_consumption/100) * this.energy_prices["BEV"][year]["mittel"]
						//computes consumption of equivalent diesel vehicle
						this.getConsumption("diesel")
						var fuel_consumption = this.second_user_yearly_mileage * (this.fuel_consumption/100) * this.energy_prices["diesel"][year]["mittel"]
						
						//computes difference
						advantage_2d_user = (fuel_consumption - elec_consumption)
					}
				}

				this.residual_value[year] += advantage_2d_user
			} 
		} else if (method == "Methode 3"){
			// Creates temp diesel machine to get the residual value
			temp_vehicle = new Vehicle({energy_type: "diesel", car_type: this.car_type, mileage:this.mileage})
			this.residual_value = temp_vehicle.residual_value
			delete temp_vehicle
		} else if (method == "Methode 4"){
			// like Method 1 but with the battery value separated
			for (var year = this.acquisition_year; year <= 2025; year++) {
				this.residual_value[year] = Math.exp(presets.restwert_constants["a"]) 										  // Constant
				this.residual_value[year] *= Math.exp(12 * presets.restwert_constants["b1"] * (year - this.acquisition_year + 1)) // Age
				this.residual_value[year] *= Math.exp(presets.restwert_constants["b2"] /12 * this.mileage)						  // Yearly mileage
				this.residual_value[year] *= Math.pow(this.price.basis_price, presets.restwert_constants["b3"])				  // Initial price minus battery
				
				var residual_battery_value = this.price.battery_price["mittel"] - this.price.battery_price["mittel"] * (year - this.acquisition_year) / this.battery_duration
				if (residual_battery_value < 0) { residual_battery_value = 0 }
				this.residual_value[year] += residual_battery_value
			}

		}
	}

	this.getMaintenanceCosts = function(){
		if (this.energy_type =="BEV" && this.charging_option != undefined) {
			this.maintenance_costs_charger = presets.lademöglichkeiten[this.charging_option]["maintenance"] / this.fleet_size;
		}
		if (this.energy_type == "BEV" && this.car_type.indexOf("LNF") == -1) {
			this.maintenance_costs_tires = presets.reperaturkosten["benzin"][this.car_type]["reifen"] ;
			this.maintenance_costs_inspection = presets.reperaturkosten["benzin"][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten["benzin"][this.car_type]["reparatur"] * presets.faktor_BEV;
		} else if (this.energy_type == "BEV" && this.car_type.indexOf("LNF") >= 0) {
			this.maintenance_costs_tires = presets.reperaturkosten["diesel"][this.car_type]["reifen"];
			this.maintenance_costs_inspection = presets.reperaturkosten["diesel"][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten["diesel"][this.car_type]["reparatur"] * presets.faktor_BEV;
		} else if (this.energy_type.indexOf("hybrid") > -1) { // Takes the same value of the non-hybrid of same type
			this.maintenance_costs_tires = presets.reperaturkosten[this.energy_type.split("-")[1]][this.car_type]["reifen"];
			this.maintenance_costs_inspection = presets.reperaturkosten[this.energy_type.split("-")[1]][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten[this.energy_type.split("-")[1]][this.car_type]["reparatur"] * presets.faktor_BEV;
		} 
		else {
			this.maintenance_costs_tires = presets.reperaturkosten[this.energy_type][this.car_type]["reifen"];
			this.maintenance_costs_inspection = presets.reperaturkosten[this.energy_type][this.car_type]["inspektion"];
			this.maintenance_costs_repairs = presets.reperaturkosten[this.energy_type][this.car_type]["reparatur"];
		}

		this.maintenance_costs_tires = ((this.maintenance_costs_tires * 12) / 20000) * this.mileage * this.traffic_multiplicator;
		this.maintenance_costs_inspection = ((this.maintenance_costs_inspection * 12) / 20000) * this.mileage * this.traffic_multiplicator;
		this.maintenance_costs_repairs = ((this.maintenance_costs_repairs * 12) / 20000) * this.mileage * this.traffic_multiplicator


		if (this.fixed_vars.hasOwnProperty("maintenance_costs_tires")) {
			this.maintenance_costs_tires = this.fixed_vars["maintenance_costs_tires"]
		}
		if (this.fixed_vars.hasOwnProperty("maintenance_costs_inspection")) {
			this.maintenance_costs_inspection = this.fixed_vars["maintenance_costs_inspection"]
		}
		if (this.fixed_vars.hasOwnProperty("maintenance_costs_repairs")) {
			this.maintenance_costs_repairs = this.fixed_vars["maintenance_costs_repairs"]
		}
		if (this.fixed_vars.hasOwnProperty("maintenance_costs_charger")) {
			this.maintenance_costs_charger = this.fixed_vars["maintenance_costs_charger"]
		}

		this.maintenance_costs_total = this.maintenance_costs_tires + this.maintenance_costs_inspection + this.maintenance_costs_repairs + this.maintenance_costs_charger;

	}

	this.getAcquisitionPrice = function() {
		this.price.total = {}
		this.price.battery_price = {}
		for (var i in scenarios) {
			var scenario = scenarios[i];
			if (this.energy_type == "benzin" || this.energy_type == "diesel") {
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
		if (this.energy_type.indexOf("hybrid") > -1 ) {
			this.reichweite = 50;
		}
		var capacity = this.reichweite * (this.electricity_consumption / 100) / presets.entladetiefe;
		var actual_capacity = capacity * presets.entladetiefe;
		return actual_capacity;
	}

	this.getFixedCosts = function() {
		
		if (this.energy_type.indexOf("hybrid") > -1) {
			energy_type = this.energy_type.split("-")[1];
		} else {
			energy_type = this.energy_type
		}

		this.fixed_costs.car_tax = presets.kfzsteuer[this.energy_type][this.car_type];
		if (this.energy_type == "BEV") { this.fixed_costs.car_tax = 0 }
		if (this.energy_type == "BEV" && this.acquisition_year >= 2021) {
			this.fixed_costs.car_tax = presets.kfzsteuer[this.energy_type][this.car_type];
		}
		this.fixed_costs.check_up = presets.untersuchung[energy_type]["AU"] + presets.untersuchung[energy_type]["HU"]
		this.fixed_costs.insurance = presets.versicherung[energy_type][this.car_type];
		this.fixed_costs.total = this.fixed_costs.car_tax + this.fixed_costs.check_up + this.fixed_costs.insurance;
	}

	this.getLubricantConsumption = function() {
		if (this.energy_type == "BEV") { return 0 }
		else if (this.energy_type.indexOf("hybrid") > -1 ) {
			var energy_type = this.energy_type.split("-")[1];
		} else { 
			var energy_type = this.energy_type;
		}
		var lubricant_consumption = presets.hubraum[energy_type][this.car_type] / 2000 * (0.5/1000);

		if (this.energy_type.indexOf("hybrid") > -1 ) { //special case for hybrids
			return presets.price_of_lubricant * lubricant_consumption * presets.hybrid_minderverbrauch_schmierstoff 
		}
		
		return presets.price_of_lubricant * lubricant_consumption;
	}

	this.getLubricantCosts = function() {
		this.lubricant_costs = this.getLubricantConsumption() * this.mileage;
	}

	this.getConsumption = function(energy_type) {
		if (energy_type.indexOf("hybrid") > -1) {
			this.getConsumption("BEV");
			this.getConsumption(energy_type.split("-")[1]);
			this.fuel_consumption *= presets.hybrid_minderverbrauch[this.car_type];
		} else {
			this.fuel_consumption = presets.verbrauch[energy_type][this.car_type];
			var improvement_first_decade = presets.verbrauchsentwicklung[energy_type]["2010"];
			var yearly_improvement_first_decade = Math.pow((1 + improvement_first_decade), (1/10)) - 1;
			var improvement_second_decade = presets.verbrauchsentwicklung[energy_type]["2020"];
			var yearly_improvement_second_decade = Math.pow(1 + improvement_second_decade, .1) - 1;

			// Need to take into account the rate of improvement of the previous decade
			if (this.acquisition_year > 2020) {
				this.fuel_consumption *= Math.pow(1+yearly_improvement_first_decade, this.acquisition_year - 2014);
				this.fuel_consumption *= Math.pow(1+yearly_improvement_second_decade, this.acquisition_year - 2020);
			} else {
				this.fuel_consumption *= Math.pow(1+yearly_improvement_first_decade, this.acquisition_year - 2014);
			}

			// Because the information for electric cars is in kWh per km
			if (energy_type == "BEV") { 
				this.electricity_consumption = this.fuel_consumption * 100;
				this.fuel_consumption = 0;
			}
		}

		if (this.fixed_vars.hasOwnProperty("fuel_consumption")) {
			this.fuel_consumption = this.fixed_vars["fuel_consumption"]
		}
		if (this.fixed_vars.hasOwnProperty("electricity_consumption")) {
			this.electricity_consumption = this.fixed_vars["electricity_consumption"]
		}

	}

	this.getEnergyPrices = function() {
		this.energy_prices = getEnergyPrice()
	}

	this.setEnergyPrices = function(new_price) {
		for (var year = this.acquisition_year; year <= 2035; year++) {
			this.energy_prices[year]["pro"] = new_price;
			this.energy_prices[year]["mittel"] = new_price;
			this.energy_prices[year]["contra"] = new_price;
		}
	}

	this.getEnergyCosts = function(){
		if (this.energy_type == "benzin" || this.energy_type == "diesel") {
			for (var year = this.acquisition_year; year <= 2035; year++) {
				this.energy_costs[year] = {}
				this.energy_costs[year]["pro"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["pro"];
				this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["mittel"];
				this.energy_costs[year]["contra"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["contra"];
			}
		} else if (this.energy_type == "BEV") {
			for (var year = this.acquisition_year; year <= 2035; year++) {
				this.energy_costs[year] = {}
				this.energy_costs[year]["pro"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["pro"];
				this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["mittel"];
				this.energy_costs[year]["contra"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["contra"];
			}
		} else { //Hybrid vehicles
			var energy_type = this.energy_type.split("-")[1];
			for (var year = this.acquisition_year; year <= 2035; year++) {
				this.energy_costs[year] = {}
				this.energy_costs[year]["pro"] = (this.mileage / 100) * this.share_electric / 100 * this.electricity_consumption * this.energy_prices["BEV"][year]["pro"];
				this.energy_costs[year]["pro"] += (this.mileage / 100) * (1 - this.share_electric / 100) * this.fuel_consumption * this.energy_prices[energy_type][year]["pro"];
				this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.share_electric / 100 * this.electricity_consumption * this.energy_prices["BEV"][year]["mittel"];
				this.energy_costs[year]["mittel"] += (this.mileage / 100) * (1 - this.share_electric / 100) * this.fuel_consumption * this.energy_prices[energy_type][year]["mittel"];
				this.energy_costs[year]["contra"] = (this.mileage / 100) * this.share_electric / 100 * this.electricity_consumption * this.energy_prices["BEV"][year]["contra"];
				this.energy_costs[year]["contra"] += (this.mileage / 100) * (1 - this.share_electric / 100) * this.fuel_consumption * this.energy_prices[energy_type][year]["contra"];
			}
		}
	}

	this.getAmortization = function() {
		for (var i in scenarios) {
			this.amortization[scenarios[i]] = {}
			var scenario = scenarios[i];
			for (var year = this.acquisition_year; year <= 2035; year++) {
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

	this.getTrainingCosts = function() {
		// Decrease in price is 5%/year
		this.training_costs = presets.schulungskosten[this.training_option] * Math.pow(1 - 0.05, this.acquisition_year - 2014) / this.fleet_size;
	}

	this.checkMaxElecShare = function() {
		// Checks that the max elec share input by the user is right. If not, set it to max
		var daily_mileage = this.mileage / presets.einsatztage_pro_jahr;
		var max_elec_share = (this.reichweite / daily_mileage) * 100;
		if (this.second_charge === true) { max_elec_share = ((this.reichweite * 2) / daily_mileage) * 100; }
		if (max_elec_share > 100){ max_elec_share = 100 }
		if (this.share_electric > max_elec_share) { this.share_electric = max_elec_share }

		this.share_electric = Math.round(this.share_electric)
	}

	this.getYearlyCosts = function(scenario, year){
		var costs = {}

		costs["fixed_costs"] = this.fixed_costs
		costs["energy_costs"] = Math.round(this.energy_costs[year][scenario])
		costs["variable_costs"] = {
			"lubricant_costs": this.lubricant_costs,
			"maintenance_costs": this.maintenance_costs_total
		}
		
		costs["amortization"] = Math.round(- this.amortization[scenario][year])
		
		// Special case for BEV vehicles older than 6 years
		if (this.energy_type == "BEV" && (year - this.acquisition_year) >= 6) {
			costs["fixed_costs"]["car_tax"] = presets.kfzsteuer[this.energy_type][this.car_type];
		}

		costs["total_cost"] = Math.round(this.fixed_costs.total + this.energy_costs[year][scenario] + this.lubricant_costs + this.maintenance_costs_total + this.price.total[scenario] - this.amortization[scenario][year] - this.residual_value[year])

		return costs
	}

	this.initCosts = function(scenario){
		// Acquisition and one-off costs
		costs = {}
		costs["vehicle_cost"] = Math.round(this.price.total[scenario])
		costs["training_costs"] = this.training_costs
		costs["total_cost"] = Math.round(this.price.total[scenario]) + this.training_costs

		// Init vars
		costs["variable_costs"] = {}
		costs["fixed_costs"] = {}
		costs["energy_costs"] = 0
		costs["variable_costs"]["lubricant_costs"] = 0
		costs["variable_costs"]["maintenance_costs"] = 0
		costs["amortization"] = 0
		costs["total_cost"] = 0
		costs["fixed_costs"]["check_up"] = 0
		costs["fixed_costs"]["insurance"] = 0
		costs["fixed_costs"]["car_tax"] = 0

		return costs
	}

	this.incrementCosts = function(costs, yearly_costs) {
		costs["energy_costs"] += yearly_costs["energy_costs"]
		costs["variable_costs"]["lubricant_costs"] += yearly_costs["variable_costs"]["lubricant_costs"]
		costs["variable_costs"]["maintenance_costs"] += yearly_costs["variable_costs"]["maintenance_costs"]
		costs["amortization"] += yearly_costs["amortization"]
		costs["total_cost"] += yearly_costs["total_cost"]
		costs["fixed_costs"]["check_up"] += yearly_costs["fixed_costs"]["check_up"]
		costs["fixed_costs"]["insurance"] += yearly_costs["fixed_costs"]["insurance"]
		costs["fixed_costs"]["car_tax"] += yearly_costs["fixed_costs"]["car_tax"]

		return costs
	}

	this.getTCOByHoldingTime = function(){
		
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.TCO_by_holding_time[scenario] = {};

			for (var holding_time = 1; holding_time <= 10; holding_time++){
				
				costs = this.initCosts(scenario)
				
				for (var current_year = this.acquisition_year; current_year <= holding_time + this.acquisition_year; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)
					
					costs = this.incrementCosts(costs, yearly_costs)
					
					// Removes the resale value 
					costs["residual_value"] = Math.round(- this.residual_value[current_year])
					costs["total_cost"] -= costs["residual_value"]
				}
			
				this.TCO_by_holding_time[scenario][holding_time] = costs

			}
		}
	}

	this.getTCOByAcquisitionYear = function(){
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.TCO_by_acquisition_year[scenario] = {};

			var acquisition_year_temp = this.acquisition_year

			for (var acquisition_year = 2014; acquisition_year <= 2025; acquisition_year++){
				
				this.acquisition_year = acquisition_year
				
				this.computeCosts()
				
				costs = this.initCosts(scenario)

				for (var current_year = acquisition_year; current_year <= acquisition_year + this.holding_time; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)
					
					costs = this.incrementCosts(costs, yearly_costs)
					
					// Removes the resale value 
					costs["residual_value"] = Math.round(- this.residual_value[current_year])
					costs["total_cost"] -= costs["residual_value"]
				}
			
				this.TCO_by_acquisition_year[scenario][acquisition_year] = costs
			}

			// goes back to initial positions
			this.acquisition_year = acquisition_year_temp

		}
	}

	this.getTCOByMileage = function(){
		for (var i in scenarios) {
			var scenario = scenarios[i];
			this.TCO_by_mileage[scenario] = {};

			var mileage = this.mileage

			for (var mileage = 0; mileage <= 100000; mileage+=10000){

				this.mileage = mileage

				this.computeCosts()
				
				costs = this.initCosts(scenario)

				for (var current_year = this.acquisition_year; current_year <= this.acquisition_year + this.holding_time; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)
					
					costs = this.incrementCosts(costs, yearly_costs)
					
					// Removes the resale value 
					costs["residual_value"] = Math.round(- this.residual_value[current_year])
					costs["total_cost"] -= costs["residual_value"]
				}
			
				this.TCO_by_mileage[scenario][mileage] = costs
			}

			// goes back to initial positions
			this.mileage = mileage

		}
	}

	this.computeCosts = function(fixed_vars) {

		if (this.fixed_vars != fixed_vars && fixed_vars != undefined){
			this.fixed_vars = extend(this.fixed_vars, fixed_vars);
			this.computeTotals();
		}

		this.traffic_multiplicator = presets.traffic_multiplicator[this.traffic];
		this.getFixedCosts();
		
		if (this.energy_type.indexOf("hybrid") > -1 ) {
			this.checkMaxElecShare();
		}
		
		this.getAcquisitionPrice();
		this.getMaintenanceCosts();
		this.getLubricantCosts();
		this.getConsumption(this.energy_type);
		this.getEnergyPrices();
		this.getEnergyCosts();
		this.getAmortization();
		this.getTrainingCosts();
		this.getResidualValue(this.residual_value_method);
		

		//Rounds all visible values to 2 decimal places
		this.fuel_consumption = Math.round(this.fuel_consumption * 100)/100
		this.electricity_consumption = Math.round(this.electricity_consumption * 100)/100
		this.maintenance_costs_total = Math.round(this.maintenance_costs_total * 100)/100
		this.maintenance_costs_repairs = Math.round(this.maintenance_costs_repairs * 100)/100
		this.maintenance_costs_inspection = Math.round(this.maintenance_costs_inspection * 100)/100
		this.maintenance_costs_tires = Math.round(this.maintenance_costs_tires * 100)/100
		this.maintenance_costs_charger = Math.round(this.maintenance_costs_charger * 100)/100
		this.lubricant_costs = Math.round(this.lubricant_costs * 100)/100
		
	}

	this.computeTotals = function(){
		this.computeCosts();
		this.getTCOByHoldingTime();
		this.getTCOByAcquisitionYear();
		this.getTCOByMileage();
	}

	this.computeTotals();

}

module.exports = Vehicle
// Static object within the Vehicle class containing all presets
module.exports.presets = presets