var presets = require('./presets');
var extend = require("xtend")
var scenarios = ["pro", "mittel", "contra"]

// Corrects amounts for inflation
function getCurrentPrice(amount, originalYear, wishedYear, inflation, rounded){
	if (inflation == undefined) { inflation = presets.inflationsrate }
	
	if (rounded == true) {
		return Math.round(amount * Math.pow(1+inflation, wishedYear - originalYear))
	} else {
		return amount * Math.pow(1+inflation, wishedYear - originalYear)
	}
}

// gets prices in the future after inflation
function getInflatedPrice(amount, period, inflation, rounded){
	if (inflation == undefined) { inflation = presets.inflationsrate }
	period = period - 1
	
	for (var i = 0; i <= period; i++) {
		amount *= (1 + inflation)
	}

	if (rounded == true) {
		return Math.round(amount)
	} else {
		return amount
	}
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
			return getRawAcquisitionPrice("diesel", car_type, year) + getPriceSurcharge("hybrid", car_type, year) + getPriceSurcharge("BEV", car_type, year);
		} else {
			return getRawAcquisitionPrice("benzin", car_type, year) + getPriceSurcharge("hybrid", car_type, year) + getPriceSurcharge("BEV", car_type, year);
		}
	} else { // Elektro car
		if (car_type.indexOf("LNF") > -1) {
			return getRawAcquisitionPrice("diesel", car_type, year) - getPriceSurcharge("diesel", "groß", year) + getPriceSurcharge(energy_type, car_type, year);
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
		for (var i = 2021; i<=2049; i++){ // Automates the fill out of surcharge
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
	for (var i = 2019; i<=2025; i++) {
		presets.batteriepreise[i] = presets.batteriepreise[i-1] - 5
	}
	if (scenario == "pro") { return presets.batteriepreise[year] * 0.9}
	else if (scenario == "contra") { return presets.batteriepreise[year] * 1.1}
	else { return presets.batteriepreise[year]; }
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
	this.mileage = 10000
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
	this.residual_value_method = "Methode 2"
	this.second_user_holding_time = 6
	this.second_user_yearly_mileage = 10000
	this.max_battery_charges = 2500
	this.battery_price = 0
	this.bev_praemie = presets.bev_praemie
	this.sonder_afa = presets.sonder_afa
	this.unternehmenssteuersatz = presets.unternehmenssteuersatz
	this.abschreibungszeitraum = presets.abschreibungszeitraum
	this.inflationsrate = presets.inflationsrate * 100
	this.discount_rate = presets.discount_rate
	this.energy_known_prices = presets.energy_known_prices
	this.energy_prices_evolution = presets.energy_prices_evolution
	this.limited = false

	for(var prop in params) {
    if( params.hasOwnProperty(prop) && this.hasOwnProperty(prop) ) {
			this[prop] = params[prop]
		}
	}

	if (this.car_type.indexOf("LNF") >= 0 && this.energy_type == "BEV"){
		this.reichweite = 130
	}

	this.share_electric_temp = this.share_electric
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

	this.TCO = {}
	this.TCO_by_holding_time = {}
	this.TCO_by_acquisition_year = {}
	this.TCO_by_mileage = {}
	this.CO2_by_holding_time = {}
	this.CO2_by_acquisition_year = {}
	this.CO2_by_mileage = {}
	for (var i in scenarios) {
		this.TCO_by_holding_time[scenarios[i]] = {}
		this.TCO_by_acquisition_year[scenarios[i]] = {}
		this.TCO_by_mileage[scenarios[i]] = {}
		this.residual_value[scenarios[i]] = 0
	}
	
	this.getEnergyPrices = function() {
		var energy_types = [{"name": "diesel", "source": "hydrocarbon"}, {"name": "benzin", "source": "hydrocarbon"}, {"name": "BEV", "source": "strom"}]
		var estimates = {}

		this.evolution_elec_price_until_2020 = this.energy_prices_evolution["strom"][0]["rate"] * 100.0
		this.evolution_elec_price_until_2030 = this.energy_prices_evolution["strom"][1]["rate"] * 100.0
		this.evolution_elec_price_until_2050 = this.energy_prices_evolution["strom"][2]["rate"] * 100.0
		this.evolution_hydrocarbon_price_until_2050 = this.energy_prices_evolution["hydrocarbon"][0]["rate"] * 100.0

		// Finds out if the evolution rate has been changed by the user
		if (this.fixed_vars.hasOwnProperty("evolution_elec_price_until_2020")) {
			this.evolution_elec_price_until_2020 = this.fixed_vars["evolution_elec_price_until_2020"]
			this.energy_prices_evolution["strom"][0]["rate"] = this.fixed_vars["evolution_elec_price_until_2020"] / 100.0
		}
		if (this.fixed_vars.hasOwnProperty("evolution_elec_price_until_2030")) {
			this.evolution_elec_price_until_2030 = this.fixed_vars["evolution_elec_price_until_2030"]
			this.energy_prices_evolution["strom"][1]["rate"] = this.fixed_vars["evolution_elec_price_until_2030"] / 100.0
		}
		if (this.fixed_vars.hasOwnProperty("evolution_elec_price_until_2050")) {
			this.evolution_elec_price_until_2050 = this.fixed_vars["evolution_elec_price_until_2050"]
			this.energy_prices_evolution["strom"][2]["rate"] = this.fixed_vars["evolution_elec_price_until_2050"] / 100.0
		}
		if (this.fixed_vars.hasOwnProperty("evolution_hydrocarbon_price_until_2050")) {
			this.evolution_hydrocarbon_price_until_2050 = this.fixed_vars["evolution_hydrocarbon_price_until_2050"]
			this.energy_prices_evolution["hydrocarbon"][0]["rate"] = this.fixed_vars["evolution_hydrocarbon_price_until_2050"] / 100.0
		}
		if (this.fixed_vars.hasOwnProperty("_2016_elec_price")) {
			this._2016_elec_price = this.fixed_vars["_2016_elec_price"]
			this.energy_known_prices["BEV"][2016] = this.fixed_vars["_2016_elec_price"]
		}
		if (this.fixed_vars.hasOwnProperty("_2016_diesel_price")) {
			this._2016_diesel_price = this.fixed_vars["_2016_diesel_price"]
			this.energy_known_prices["diesel"][2016] = this.fixed_vars["_2016_diesel_price"]
		}
		if (this.fixed_vars.hasOwnProperty("_2016_benzin_price")) {
			this._2016_benzin_price = this.fixed_vars["_2016_benzin_price"]
			this.energy_known_prices["benzin"][2016] = this.fixed_vars["_2016_benzin_price"]
		}


		for (var i in energy_types) {
			var energy_type = energy_types[i]["name"]
			var energy_source = energy_types[i]["source"]
			estimates[energy_type] = {}

			for (var year = 2014; year <= 2050; year++) {
				
				estimates[energy_type][year] = {}

				// Checks if the value exists for the given year
				if (this.energy_known_prices[energy_type].hasOwnProperty(year)) {
					estimates[energy_type][year]["mittel"] = this.energy_known_prices[energy_type][year]
				} else {
					// Computes the estimate by finding the growth rate to use
					var evolution_rate = 0
					for (var j in this.energy_prices_evolution[energy_source]) {
						if (this.energy_prices_evolution[energy_source][j]["start_year"] <= year && this.energy_prices_evolution[energy_source][j]["end_year"] >= year){
							evolution_rate = this.energy_prices_evolution[energy_source][j]["rate"]
						}
					}
					// Applies the growth rate to get the price for the current year
					estimates[energy_type][year]["mittel"] = estimates[energy_type][year - 1]["mittel"] * (1 + evolution_rate)
				}

				if (energy_type == "BEV"){
					estimates[energy_type][year]["pro"] = estimates[energy_type][year]["mittel"] * .9
		    		estimates[energy_type][year]["contra"] = estimates[energy_type][year]["mittel"] * 1.1
				} else {
					estimates[energy_type][year]["pro"] = estimates[energy_type][year]["mittel"] * 1.1
		    		estimates[energy_type][year]["contra"] = estimates[energy_type][year]["mittel"] * .9
				}
			}
		}

		this.energy_prices = estimates
		this._2016_elec_price = this.energy_prices["BEV"][2016]["mittel"]
		this._2016_diesel_price = this.energy_prices["diesel"][2016]["mittel"]
		this._2016_benzin_price = this.energy_prices["benzin"][2016]["mittel"]
	
	}

	this.getResidualValue = function(method){
		for (var i in scenarios) {
			var scenario = scenarios[i]

			if (this.energy_type == "diesel" || this.energy_type == "benzin"){
				this.residual_value[scenario] = Math.exp(presets.restwert_constants["a"]) 										  // Constant
				this.residual_value[scenario] *= Math.exp(12 * presets.restwert_constants["b1"] * (this.holding_time)) // Age
				this.residual_value[scenario] *= Math.exp(presets.restwert_constants["b2"] /12 * this.mileage)						  // Yearly mileage
				this.residual_value[scenario] *= Math.pow(this.price.total[scenario] - this.price.charging_option, presets.restwert_constants["b3"])				  // Initial price
			} else if (method == "Methode 1" && this.energy_type == "BEV"){ 
				temp_vehicle = new Vehicle({energy_type: "diesel",
											car_type: this.car_type,
											mileage: this.mileage,
											acquisition_year: this.acquisition_year,
											holding_time: this.holding_time,
											traffic: this.traffic,
											second_user_holding_time: this.second_user_holding_time,
											second_user_yearly_mileage: this.second_user_yearly_mileage,
											unternehmenssteuersatz: this.unternehmenssteuersatz,
											abschreibungszeitraum: this.abschreibungszeitraum,
											inflationsrate: this.inflationsrate,
											discount_rate: this.discount_rate,
											energy_known_prices: this.energy_known_prices,
											energy_prices_evolution: this.energy_prices_evolution,
											limited: true})
				var residual_value_ratio = temp_vehicle.residual_value["mittel"] / temp_vehicle.acquisition_price
				
				delete temp_vehicle

				this.residual_value[scenario] = this.acquisition_price * residual_value_ratio
			
			}else if (method == "Methode 2"){
				
				// Computes the advantage of the 2d user
				var my_consumption = fuel_consumption = advantage_2d_user = 0
				
				if (this.energy_type != "hybrid-benzin" && this.energy_type != "hybrid-diesel"){
					this.getConsumption("diesel")
				}

				for (var year2 = this.acquisition_year + this.holding_time; year2 < this.acquisition_year + this.holding_time + this.second_user_holding_time; year2++) {
					
					// Hybrid vehicles
					if (this.energy_type == "hybrid-benzin" || this.energy_type == "hybrid-diesel"){
						var energy_type = this.energy_type.split("-")[1]
						my_consumption += (this.mileage / 100) * this.share_electric / 100 * this.electricity_consumption * this.energy_prices["BEV"][year2]["mittel"];
						my_consumption += (this.mileage / 100) * (1 - this.share_electric / 100) * this.fuel_consumption * this.energy_prices[energy_type][year2]["mittel"];
						
					} else {
						//computes consumption
						my_consumption += this.second_user_yearly_mileage * (this.electricity_consumption/100) * this.energy_prices["BEV"][year2][scenario]
					}
					//computes consumption of equivalent diesel vehicle
					fuel_consumption += this.second_user_yearly_mileage * (this.fuel_consumption/100) * this.energy_prices["diesel"][year2][scenario]	
				}

				// Not for LNF
				if (this.car_type.indexOf("LNF") < 0){
					
					if (this.energy_type != "hybrid-benzin" && this.energy_type != "hybrid-diesel"){
						this.getConsumption("benzin")
					}
					
					for (var year2 = this.acquisition_year + this.holding_time; year2 < this.acquisition_year + this.holding_time + this.second_user_holding_time; year2++) {
						//computes consumption of equivalent diesel vehicle
						fuel_consumption += this.second_user_yearly_mileage * (this.fuel_consumption/100) * this.energy_prices["benzin"][year2][scenario]	
					}

					fuel_consumption = fuel_consumption/2
				}

				//computes difference
				advantage_2d_user = fuel_consumption - my_consumption

				
				temp_vehicle_diesel = new Vehicle({energy_type: "diesel",
										car_type: this.car_type,
										mileage: this.mileage,
										acquisition_year: this.acquisition_year,
										holding_time: this.holding_time,
										traffic: this.traffic,
										second_user_holding_time: this.second_user_holding_time,
										second_user_yearly_mileage: this.second_user_yearly_mileage,
										unternehmenssteuersatz: this.unternehmenssteuersatz,
										abschreibungszeitraum: this.abschreibungszeitraum,
										inflationsrate: this.inflationsrate,
										discount_rate: this.discount_rate,
										energy_known_prices: this.energy_known_prices,
										energy_prices_evolution: this.energy_prices_evolution,
										limited: true})

				// Adds residual value of a Benzin vehicle if not LNF
				
				if (this.car_type != "LNF1" && this.car_type != "LNF2") {
					temp_vehicle_benzin = new Vehicle({energy_type: "benzin",
										car_type: this.car_type,
										mileage: this.mileage,
										acquisition_year: this.acquisition_year,
										holding_time: this.holding_time,
										traffic: this.traffic,
										second_user_holding_time: this.second_user_holding_time,
										second_user_yearly_mileage: this.second_user_yearly_mileage,
										unternehmenssteuersatz: this.unternehmenssteuersatz,
										abschreibungszeitraum: this.abschreibungszeitraum,
										inflationsrate: this.inflationsrate,
										discount_rate: this.discount_rate,
										energy_known_prices: this.energy_known_prices,
										energy_prices_evolution: this.energy_prices_evolution,
										limited: true})
					
				}

				if (this.car_type == "LNF1" || this.car_type == "LNF2" || this.car_type == "groß"){
					this.residual_value[scenario] = temp_vehicle_diesel.residual_value["mittel"] + advantage_2d_user
				}
				else if (this.car_type == "mittel") {
					this.residual_value[scenario] = (temp_vehicle_diesel.residual_value["mittel"] + temp_vehicle_benzin.residual_value["mittel"]) / 2 + advantage_2d_user
				} else if (this.car_type == "klein") {
					this.residual_value[scenario] = temp_vehicle_benzin.residual_value["mittel"] + advantage_2d_user
				}

				
				delete temp_vehicle_benzin
				delete temp_vehicle_diesel
			
			} else if (method == "Methode 3"){
				// Creates temp diesel machine to get the residual value
				temp_vehicle = new Vehicle({energy_type: "diesel",
										car_type: this.car_type,
										mileage: this.mileage,
										acquisition_year: this.acquisition_year,
										holding_time: this.holding_time,
										traffic: this.traffic,
										second_user_holding_time: this.second_user_holding_time,
										second_user_yearly_mileage: this.second_user_yearly_mileage,
										unternehmenssteuersatz: this.unternehmenssteuersatz,
										abschreibungszeitraum: this.abschreibungszeitraum,
										inflationsrate: this.inflationsrate,
										discount_rate: this.discount_rate,
										energy_known_prices: this.energy_known_prices,
										energy_prices_evolution: this.energy_prices_evolution,
										limited: true})
				this.residual_value[scenario] = temp_vehicle.residual_value["mittel"]
				delete temp_vehicle

			}
		}
	}

	this.getMaintenanceCosts = function(){
		if ((this.energy_type =="BEV" || this.energy_type.indexOf("hybrid") > -1) && this.charging_option != undefined) {
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
			this.maintenance_costs_repairs = presets.reperaturkosten[this.energy_type.split("-")[1]][this.car_type]["reparatur"]// * presets.faktor_HEV
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
			var scenario = scenarios[i]
			if (this.energy_type == "benzin" || this.energy_type == "diesel") {
				this.price.basis_price = getRawAcquisitionPrice(this.energy_type, this.car_type, this.acquisition_year)
				this.acquisition_price = this.price.basis_price
				this.price.charging_option = 0
				if (this.fixed_vars.hasOwnProperty("acquisition_price")) {
					this.acquisition_price = this.fixed_vars["acquisition_price"]
					this.price.basis_price = this.fixed_vars["acquisition_price"]
				}
				this.price.total[scenario] = this.price.basis_price
				this.price.battery_price[scenario] = 0
			} else {
				this.price.basis_price = getRawAcquisitionPrice(this.energy_type, this.car_type, this.acquisition_year)
				this.price.battery_price[scenario] = this.getBatteryPrice(scenario)
				this.price.charging_option = getChargingOptionPrice(this.charging_option, this.acquisition_year) / this.fleet_size
				this.acquisition_price = this.price.basis_price + this.price.battery_price["mittel"]
				if (this.fixed_vars.hasOwnProperty("acquisition_price")) {
					this.acquisition_price = this.fixed_vars["acquisition_price"]
					this.price.basis_price = this.fixed_vars["acquisition_price"] - this.price.battery_price[scenario]
				}
				this.price.total[scenario] = this.price.basis_price + this.price.battery_price[scenario] + this.price.charging_option
			}

			// Takes into accont the special cash reward of 3000€ that decreases by 500€ every year
			if (this.bev_praemie == true) {
				if (this.acquisition_year >= 2016) {
					this.price.cash_bonus = 3000 - 500 * (this.acquisition_year - 2016)
					
					if (this.price.cash_bonus < 0){
						this.price.cash_bonus = 0
					}
					this.price.total[scenario] -= this.price.cash_bonus
					
				}
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
		return this.battery_size * getBatteryPricePerKWh(this.acquisition_year, scenario);
	}

	this.getNeededBatterySize = function() {
		if (this.energy_type.indexOf("hybrid") > -1 ) {
			this.reichweite = 50
		}
		var capacity = this.reichweite * (this.electricity_consumption / 100) / presets.entladetiefe
		var actual_capacity = capacity * presets.entladetiefe
		this.battery_size = actual_capacity
	}

	this.getFixedCosts = function() {
		
		if (this.energy_type.indexOf("hybrid") > -1) {
			energy_type = this.energy_type.split("-")[1]
		} else {
			energy_type = this.energy_type
		}

		if (this.energy_type == "BEV" && this.acquisition_year >= 2021) {
			this.fixed_costs_car_tax = presets.kfzsteuer[this.energy_type][this.car_type]
		} else {
			this.fixed_costs_car_tax = presets.kfzsteuer[this.energy_type][this.car_type]
		}
		this.fixed_costs_check_up = presets.untersuchung[energy_type]["AU"] + presets.untersuchung[energy_type]["HU"]
		this.fixed_costs_insurance = presets.versicherung[energy_type][this.car_type]


		if (this.fixed_vars.hasOwnProperty("fixed_costs_car_tax")) {
			this.fixed_costs_car_tax = this.fixed_vars["fixed_costs_car_tax"]
			presets.kfzsteuer["BEV"][this.car_type] = this.fixed_vars["fixed_costs_car_tax"]
		}
		if (this.fixed_vars.hasOwnProperty("fixed_costs_check_up")) {
			this.fixed_costs_check_up = this.fixed_vars["fixed_costs_check_up"]
		}
		if (this.fixed_vars.hasOwnProperty("fixed_costs_insurance")) {
			this.fixed_costs_insurance = this.fixed_vars["fixed_costs_insurance"]
		}

		// Overrides user-defined tax level if year is less than 2021
		if (this.energy_type == "BEV" && this.acquisition_year < 2021) { 
			this.fixed_costs_car_tax = 0 
		}

		this.fixed_costs.car_tax = this.fixed_costs_car_tax
		this.fixed_costs.check_up = this.fixed_costs_check_up
		this.fixed_costs.insurance = this.fixed_costs_insurance
		this.fixed_costs.total = this.fixed_costs.car_tax + this.fixed_costs.check_up + this.fixed_costs.insurance
		this.fixed_costs_total = this.fixed_costs.car_tax + this.fixed_costs.check_up + this.fixed_costs.insurance
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

	this.setEnergyPrices = function(new_price) {
		for (var year = this.acquisition_year; year <= 2049; year++) {
			this.energy_prices[year]["pro"] = new_price;
			this.energy_prices[year]["mittel"] = new_price;
			this.energy_prices[year]["contra"] = new_price;
		}
	}

	this.getEnergyCosts = function(){
		if (this.energy_type == "benzin" || this.energy_type == "diesel") {
			for (var year = this.acquisition_year; year <= 2049; year++) {
				this.energy_costs[year] = {}
				this.energy_costs[year]["pro"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["pro"];
				this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["mittel"];
				this.energy_costs[year]["contra"] = (this.mileage / 100) * this.fuel_consumption * this.energy_prices[this.energy_type][year]["contra"];
			}
		} else if (this.energy_type == "BEV") {
			for (var year = this.acquisition_year; year <= 2049; year++) {
				this.energy_costs[year] = {}
				this.energy_costs[year]["pro"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["pro"];
				this.energy_costs[year]["mittel"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["mittel"];
				this.energy_costs[year]["contra"] = (this.mileage / 100) * this.electricity_consumption * this.energy_prices[this.energy_type][year]["contra"];
			}
		} else { //Hybrid vehicles
			var energy_type = this.energy_type.split("-")[1];
			for (var year = this.acquisition_year; year <= 2049; year++) {
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
			var scenario = scenarios[i]

			for (var year = this.acquisition_year; year <= 2035; year++) {

				// Computes the amortization of the vehicle
				if (year < this.acquisition_year + this.abschreibungszeitraum){
					if (year == this.acquisition_year && this.sonder_afa == true && this.energy_type=="BEV"){
						this.amortization[scenario][year] = (this.price.basis_price + this.price.battery_price[scenario]) * .5 * this.unternehmenssteuersatz
					} else if (this.sonder_afa == true && this.energy_type=="BEV") {
						this.amortization[scenario][year] = (1 / this.abschreibungszeitraum) * this.unternehmenssteuersatz * (this.price.basis_price + this.price.battery_price[scenario]) * .5
					} else {
						//Normal amortization
						this.amortization[scenario][year] = (1 / this.abschreibungszeitraum) * this.unternehmenssteuersatz * (this.price.basis_price + this.price.battery_price[scenario])
					}	
				} else {
					this.amortization[scenario][year] = 0
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

		if (this.second_charge === true) { 
			max_elec_share = ((this.reichweite * 2) / daily_mileage) * 100; 
		}

		if (max_elec_share > 100){ max_elec_share = 100 }
		if (this.share_electric > max_elec_share) { 
			this.share_electric = max_elec_share 
		} else {
			if (this.fixed_vars.hasOwnProperty("share_electric")) {
				this.share_electric = this.fixed_vars["share_electric"]
			} else {
				this.share_electric = this.share_electric_temp
			}
		}

		this.share_electric = Math.round(this.share_electric)
	}

	this.getYearlyCosts = function(scenario, year){
		var costs = {}

		if (this.fixed_vars.hasOwnProperty("inflationsrate")) {
			this.inflationsrate = this.fixed_vars["inflationsrate"]
		}

		costs["fixed_costs"] = {
			"check_up" : getInflatedPrice(this.fixed_costs.check_up, year - this.acquisition_year, this.inflationsrate/100, true),
			"insurance" : getInflatedPrice(this.fixed_costs.insurance, year - this.acquisition_year, this.inflationsrate/100, true),
			"car_tax" : getInflatedPrice(this.fixed_costs.car_tax, year - this.acquisition_year, this.inflationsrate/100, true)
		}

		costs["energy_costs"] = getInflatedPrice(this.energy_costs[year][scenario], year - this.acquisition_year, this.inflationsrate/100, true)

		costs["variable_costs"] = {
			"lubricant_costs": getInflatedPrice(this.lubricant_costs, year - this.acquisition_year, this.inflationsrate/100, true),
			"maintenance_costs": getInflatedPrice(this.maintenance_costs_total, year - this.acquisition_year, this.inflationsrate/100, true),
			"amortization": - getInflatedPrice((this.maintenance_costs_total - this.maintenance_costs_charger + this.lubricant_costs) * this.unternehmenssteuersatz, year - this.acquisition_year, this.inflationsrate/100, true)
		}
		
		costs["amortization"] = Math.round(- this.amortization[scenario][year])
		
		// Special case for BEV vehicles older than 6 years
		if (this.energy_type == "BEV" && (year - this.acquisition_year) >= 6) {
			costs["fixed_costs"]["car_tax"] = getInflatedPrice(presets.kfzsteuer[this.energy_type][this.car_type], year - this.acquisition_year, this.inflationsrate/100, true)
		} else if (this.energy_type == "BEV" && (year - this.acquisition_year) < 6) {
			costs["fixed_costs"]["car_tax"] = 0
		}

		costs["total_cost"] = Math.round(costs["fixed_costs"]["check_up"] + costs["fixed_costs"]["insurance"] + costs["fixed_costs"]["car_tax"] + costs["energy_costs"] + costs["variable_costs"]["lubricant_costs"] + costs["variable_costs"]["maintenance_costs"] + costs["variable_costs"]["amortization"] - this.amortization[scenario][year])

		costs = this.discountCosts(costs, year - this.acquisition_year)

		return costs
	}

	this.getYearlyCO2 = function(year){
		
		co2 = 0;

		if (this.energy_type == "BEV") {
			if (this.energy_source == "strom_mix") {
				co2 = (this.mileage / 100) * this.electricity_consumption * getCO2FromElectricityMix(year)
			} 
			else if (this.energy_source == "strom_erneubar") {
				co2 = (this.mileage / 100) * this.electricity_consumption * presets.co2_emissions[this.energy_source]
			}
		}

		else if (this.energy_type.indexOf("hybrid") > -1) {
			
			if (this.energy_source == "strom_mix") {
				co2 = (this.mileage / 100) * (this.share_electric /100) *  this.electricity_consumption * getCO2FromElectricityMix(year)
			} else if (this.energy_source == "strom_erneubar") {
				co2 = (this.mileage / 100) * this.electricity_consumption * presets.co2_emissions[this.energy_source]
			}

			co2 += (this.mileage / 100) * (1-this.share_electric /100) *  this.fuel_consumption * presets.co2_emissions[this.energy_type.split("-")[1]]
		}
		else {
			co2 = (this.mileage / 100) * this.fuel_consumption * presets.co2_emissions[this.energy_type]
		}

		return co2
	}

	this.initCosts = function(scenario){
		// Acquisition and one-off costs
		costs = {}
		costs["vehicle_basis_cost"] = Math.round(this.price.basis_price + this.price.battery_price[scenario])
		// Line removed following email from Apr 5
		//costs["vehicle_battery"] = Math.round(this.price.battery_price[scenario])
		costs["charging_infrastructure"] = Math.round(this.price.charging_option)
		costs["training_costs"] = this.training_costs
		costs["total_cost"] = Math.round(this.price.total[scenario]) + this.training_costs

		costs["residual_value"] = - this.residual_value[scenario]
		costs["residual_value"] = getInflatedPrice(costs["residual_value"], this.holding_time, this.inflationsrate/100, false)
		costs["residual_value"] = Math.round(costs["residual_value"] / Math.pow(1 + this.discount_rate, this.holding_time - 1))

		// Init vars
		costs["variable_costs"] = {}
		costs["fixed_costs"] = {}
		costs["energy_costs"] = 0
		costs["variable_costs"]["lubricant_costs"] = 0
		costs["variable_costs"]["maintenance_costs"] = 0
		costs["variable_costs"]["amortization"] = 0
		costs["amortization"] = 0
		costs["fixed_costs"]["check_up"] = 0
		costs["fixed_costs"]["insurance"] = 0
		costs["fixed_costs"]["car_tax"] = 0

		return costs
	}

	this.incrementCosts = function(costs, yearly_costs) {
		costs["energy_costs"] += yearly_costs["energy_costs"]
		costs["variable_costs"]["lubricant_costs"] += yearly_costs["variable_costs"]["lubricant_costs"]
		costs["variable_costs"]["maintenance_costs"] += yearly_costs["variable_costs"]["maintenance_costs"]
		costs["variable_costs"]["amortization"] += yearly_costs["variable_costs"]["amortization"]
		costs["amortization"] += yearly_costs["amortization"]
		costs["total_cost"] += yearly_costs["total_cost"]
		costs["fixed_costs"]["check_up"] += yearly_costs["fixed_costs"]["check_up"]
		costs["fixed_costs"]["insurance"] += yearly_costs["fixed_costs"]["insurance"]
		costs["fixed_costs"]["car_tax"] += yearly_costs["fixed_costs"]["car_tax"]

		return costs
	}

	this.discountCosts = function(costs, period) {
		// discounts all positions
		for (var i in costs) {
			if (Object.keys(costs[i]).length > 0){

				for (var j in costs[i]) {
					costs[i][j] = Math.round(costs[i][j] / Math.pow(1 + this.discount_rate, period))
				}
			} else {
				costs[i] = Math.round(costs[i] / Math.pow(1 + this.discount_rate, period))
			}
		}

		return costs
	}

	this.getTCO = function() {
		this.TCO = this.TCO_by_mileage["mittel"][this.mileage]
	}

	this.getTCOByHoldingTime = function(){
		
		for (var i in scenarios) {
			var scenario = scenarios[i];

			for (var holding_time = 1; holding_time <= 12; holding_time++){
				
				costs = this.initCosts(scenario)
				co2 = 0
				
				for (var current_year = this.acquisition_year; current_year < holding_time + this.acquisition_year; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)

					costs = this.incrementCosts(costs, yearly_costs)
					co2 += this.getYearlyCO2(current_year)

				}

				// Removes the resale value 
				costs["total_cost"] += costs["residual_value"]

			
				this.TCO_by_holding_time[scenario][holding_time] = costs
				this.CO2_by_holding_time[holding_time] = co2

			}
		}
	}

	this.getTCOByAcquisitionYear = function(){
		for (var i in scenarios) {
			var scenario = scenarios[i];

			var acquisition_year_temp = this.acquisition_year

			for (var acquisition_year = 2014; acquisition_year <= 2025; acquisition_year++){
				
				this.acquisition_year = acquisition_year
				
				this.computeCosts()
				
				costs = this.initCosts(scenario)
				co2 = 0

				for (var current_year = acquisition_year; current_year < acquisition_year + this.holding_time; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)
					
					costs = this.incrementCosts(costs, yearly_costs)
					co2 += this.getYearlyCO2(current_year)
					
				}

				// Removes the resale value 
				
				costs["total_cost"] += costs["residual_value"]
			
				this.TCO_by_acquisition_year[scenario][acquisition_year] = costs
				this.CO2_by_acquisition_year[acquisition_year] = co2
			}

			// goes back to initial positions
			this.acquisition_year = acquisition_year_temp
			this.computeCosts()

		}
	}

	this.getTCOByMileage = function(){
		for (var i in scenarios) {
			var scenario = scenarios[i];

			var mileage_temp = this.mileage

			for (var mileage = 0; mileage <= 100000; mileage+=5000){

				this.mileage = mileage

				this.computeCosts()
				
				costs = this.initCosts(scenario)
				co2 = 0

				for (var current_year = this.acquisition_year; current_year < this.acquisition_year + this.holding_time; current_year++){
					
					//Yearly costs
					var yearly_costs = this.getYearlyCosts(scenario, current_year)
					
					costs = this.incrementCosts(costs, yearly_costs)
					co2 += this.getYearlyCO2(current_year)

				}

				// Removes the resale value 
				
				costs["total_cost"] += costs["residual_value"]
			
				this.TCO_by_mileage[scenario][mileage] = costs
				this.CO2_by_mileage[mileage] = co2
			}

			// goes back to initial positions
			this.mileage = mileage_temp
			// also for the max elec share, which has changed
			if (this.energy_type.indexOf("hybrid") > -1 ) {
				this.checkMaxElecShare()
			}
			this.computeCosts()

		}
	}

	this.computeCosts = function(fixed_vars) {

		if (this.fixed_vars != fixed_vars && fixed_vars != undefined){
			this.fixed_vars = extend(this.fixed_vars, fixed_vars);
			for(var prop in fixed_vars) {
			    if(fixed_vars.hasOwnProperty(prop) && this.hasOwnProperty(prop) ) {
						this[prop] = fixed_vars[prop]
				}
			}
			this.computeTotals()
		}

		this.traffic_multiplicator = presets.traffic_multiplicator[this.traffic];
		this.getFixedCosts();
		
		if (this.energy_type.indexOf("hybrid") > -1 ) {
			this.checkMaxElecShare();
		}
		
		this.getNeededBatterySize()
		this.getAcquisitionPrice()
		this.getMaintenanceCosts()
		this.getLubricantCosts()
		this.getConsumption(this.energy_type)
		this.getEnergyPrices()
		this.getEnergyCosts()
		this.getAmortization()
		this.getTrainingCosts()
		this.getResidualValue(this.residual_value_method)
		
		//Rounds all visible values to 2 decimal places
		this.fuel_consumption = this.fuel_consumption
		this.electricity_consumption = Math.round(this.electricity_consumption * 100)/100
		this.maintenance_costs_total = Math.round(this.maintenance_costs_total * 100)/100
		this.maintenance_costs_repairs = Math.round(this.maintenance_costs_repairs * 100)/100
		this.maintenance_costs_inspection = Math.round(this.maintenance_costs_inspection * 100)/100
		this.maintenance_costs_tires = Math.round(this.maintenance_costs_tires * 100)/100
		this.maintenance_costs_charger = Math.round(this.maintenance_costs_charger * 100)/100
		this.lubricant_costs = Math.round(this.lubricant_costs * 100)/100
		
	}

	this.computeTotals = function(){
		this.computeCosts()
		this.getTCOByHoldingTime()
		this.getTCOByAcquisitionYear()
		this.getTCOByMileage()
		this.getTCO()
	}
	this.computeCosts()

	if (this.limited == false){
		this.computeTotals()
	}

}

module.exports = Vehicle
// Static object within the Vehicle class containing all presets
module.exports.presets = presets

// vehicle = new Vehicle({car_type:"groß", energy_type:"hybrid-benzin", mileage:15000, charging_option:"Wallbox bis 22kW", second_user_yearly_mileage:15000, residual_value_method: "Methode 2"})
// console.log(vehicle.fuel_consumption)
// console.log(vehicle.TCO)
// console.log(vehicle.residual_value["mittel"])