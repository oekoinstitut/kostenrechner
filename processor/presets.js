// Financial variables
var inflationsrate   = 0.015		// That's 1.5% per year
var exchange_rate    = 1.25 		// How many $ for 1 €
var discount_rate    = 0.05			// 5% per year
var abschreibungszeitraum = 6  	    // amortization period
var unternehmenssteuersatz = 30 	// corporate tax
var sonder_afa = false				// special accounting rule to increase amortization for electro vehicles in the first year deactivated by default
var praemie = true 			    // Cash bonus activated by default
var praemie_bev = 4000
var praemie_hybrid = 3000           

// Energy prices in € per Liter and cents per kWh
var energy_known_prices = {
	"diesel": {
		"2014": 1.1349,
		"2015": 0.9841,
		"2017": 1.0084,
    "2019": 1.0647
	},
	"benzin": {
		"2014": 1.2843,
		"2015": 1.1711,
		"2017": 1.1765,
    "2019": 1.2067
	},
	"BEV": {
		"2014": .2449,
		"2015": .2410,
		"2017": .2101,
    "2019": .2595
	}
}

// Evolution of energy prices
var energy_prices_evolution = {
	"hydrocarbon": [
		{
			"start_year": 2014,
			"end_year": 2050,
			"rate": .02
		}
	],
	"strom": [
		{
			"start_year": 2014,
			"end_year": 2020,
			"rate": .013
		},
		{
			"start_year": 2021,
			"end_year": 2030,
			"rate": -.0028
		},
		{
			"start_year": 2031,
			"end_year": 2050,
			"rate": -.0058
		},	
	]
}

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
		"klein": 0.13769970166402,
		"mittel": 0.06650397416879,
		"groß": 0.03657428879589
	},
	"diesel":{
		"klein": 0.08550544026416,
		"mittel": 0.03211188878158,
		"groß": 0.02215547961983,
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
		"klein": 1480,
		"mittel": 2425,
		"groß": 3830
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
var reichweite = {
	"klein": 150.0,
	"mittel": 200.0,
	"groß": 350.0,
	"LNF1": 130.0,
	"LNF2": 130.0
} 			
var batteriepreise = {			// in € per kWh
	"2014": 400.0,	
	"2015": 380.0,
	"2016": 350.0,
	"2017": 300.0,
	"2018": 290.0
  "2019": 237.0
  "2020": 202.0
  "2021": 176.0

}

// Charging options costs in EUR
var lademöglichkeiten = { 
	"Keine": { "acquisition": 0, "maintenance": 0},
	"Wallbox 3.7kW": { "acquisition": 350, "maintenance": 0},
	"Wallbox bis 22kW": { "acquisition": 800, "maintenance": 0},
	"Ladesäule 22kW": { "acquisition": 2600, "maintenance": 330},
	"Ladesäule 43.6kW": { "acquisition": 15250, "maintenance": 1600},
	"Ladesäule 100 kW DC": { "acquisition": 48500, "maintenance": 4600}	
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

// Consumption in liters or kWh per 100 km
var verbrauch = {
	"benzin": {"klein": 6.94, "mittel": 8.08,"groß": 8.86},
	"diesel": {"klein": 4.99, "mittel": 6,"groß": 6.39, "LNF1": 8.4, "LNF2": 9.8},
	"BEV":    {"klein": .15, "mittel": .19,"groß": .236, "LNF1": .25, "LNF2": .30},
	"hybrid": {"klein": 5.21, "mittel": 6.06,"groß": 6.64}
				}

// Hybrid fuel consumption discount
var hybrid_minderverbrauch = {
	"klein" : .918,
	"mittel" : .9211,
	"groß" : .8725
}

// Hybrid lubricant consumption discount
var hybrid_minderverbrauch_schmierstoff = .45

//Number of days in the year when the vehicle is in use
var einsatztage_pro_jahr = 250

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
	"hybrid-benzin": {"klein": 23, "mittel": 38,"groß": 48},
	"hybrid-diesel": {"klein": 37, "mittel": 68,"groß": 79},
	"BEV":    {"klein": 33.75, "mittel": 45,"groß": 56.25, "LNF1": 56.25, "LNF2": 67.5}
				}

// Yearly check up in €
var untersuchung = {
	"benzin": {"HU": 53.5, "AU": 41},
	"diesel": {"HU": 53.5, "AU": 41},
	"BEV":    {"HU": 53.5, "AU": 0}
				}

// Variables for repairs
var faktor_BEV = 0.5 	// Discount for repairs of electro vehicles
var faktor_HEV = 0.96 	// Discount for repairs of hybrid vehicles
var traffic_multiplicator = {
	"normaler Verkehr" : 1,
	"schwerer Verkehr" : 1.2,
	"sehr schwerer Verkehr" : 2
}

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

// Calculation of the residual values
var restwert_constants = {
	"a": 0.97948,
	"b1": -0.01437,
	"b2": -0.000117,
	"b3": 0.91569
}

/* Disused variables */

//Training costs for electrical cars in 2014
var schulungskosten = {
	"keine Schulung": 0,
	"Schulung intern": 30,
	"Schulung externer Dienstleister": 1000
}

// Variables for oil prices
var oil_price_2014   = {"diesel": 1.217/1.19, "benzin":1.546/1.19} 		// € per L
var mineralölsteuer  = {"diesel": 0.4704, "benzin":0.6545} 		// € per L
var deckungsbeitrag  = {"diesel": 0.1563, "benzin":0.1227}		// € per L
var mehrwertsteuer   = 0										// No VAT for professionals
var price_per_barrel = {"2020": 117, "2030": 124, "2050": 128}	// In $-2011

//Variables for electricity prices in cents per kWh in 2011 €
var electricity_prices = {
	"2014": { "private": .2913/1.19, "industrie": .1349 },		// In 2014 - €
	"2020": { "private": .292/1.19, "industrie": .159 },		// In 2011 - €
	"2030": { "private": .284/1.19, "industrie": .157 },		// In 2011 - €
	"2050": { "private": .268/1.19, "industrie": .147/1.19 }	// In 2011 - €
}

exports.inflationsrate = inflationsrate
exports.exchange_rate = exchange_rate
exports.abschreibungszeitraum = abschreibungszeitraum
exports.unternehmenssteuersatz = unternehmenssteuersatz
exports.sonder_afa = sonder_afa
exports.nettolistenpreise = nettolistenpreise
exports.kostensteigerung20102030 = kostensteigerung20102030
exports.aufpreis = aufpreis
exports.entladetiefe = entladetiefe
exports.reichweite = reichweite
exports.batteriepreise = batteriepreise
exports.lademöglichkeiten = lademöglichkeiten
exports.oil_price_2014 = oil_price_2014
exports.mineralölsteuer = mineralölsteuer
exports.deckungsbeitrag = deckungsbeitrag
exports.mehrwertsteuer = mehrwertsteuer
exports.price_per_barrel = price_per_barrel
exports.electricity_prices = electricity_prices
exports.verbrauchsentwicklung = verbrauchsentwicklung
exports.price_of_lubricant = price_of_lubricant
exports.hubraum = hubraum
exports.verbrauch = verbrauch
exports.versicherung = versicherung
exports.kfzsteuer = kfzsteuer
exports.untersuchung = untersuchung
exports.faktor_BEV = faktor_BEV
exports.faktor_HEV = faktor_HEV
exports.reperaturkosten = reperaturkosten
exports.co2_emissions = co2_emissions
exports.traffic_multiplicator = traffic_multiplicator
exports.schulungskosten = schulungskosten
exports.hybrid_minderverbrauch = hybrid_minderverbrauch
exports.hybrid_minderverbrauch_schmierstoff = hybrid_minderverbrauch_schmierstoff
exports.einsatztage_pro_jahr = einsatztage_pro_jahr
exports.restwert_constants = restwert_constants
exports.praemie = praemie
exports.praemie_hybrid = praemie_hybrid
exports.praemie_bev = praemie_bev
exports.discount_rate = discount_rate
exports.energy_prices_evolution = energy_prices_evolution
exports.energy_known_prices = energy_known_prices
