
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
	"Wallbox 3.7kW": { "acquisition": 350, "maintenance": 15},
	"Wallbox bis 22kW": { "acquisition": 800, "maintenance": 50},
	"Ladesäule 22kW": { "acquisition": 2600, "maintenance": 330},
	"Ladesäule 43.6kW": { "acquisition": 15250, "maintenance": 1600},
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

exports.inflationsrate = inflationsrate;
exports.exchange_rate = exchange_rate;
exports.abschreibungszeitraum = abschreibungszeitraum;
exports.unternehmenssteuersatz = unternehmenssteuersatz;
exports.sonder_afa = sonder_afa;
exports.nettolistenpreise = nettolistenpreise;
exports.kostensteigerung20102030 = kostensteigerung20102030;
exports.aufpreis = aufpreis;
exports.entladetiefe = entladetiefe;
exports.reichweite = reichweite;
exports.batteriepreise = batteriepreise;
exports.lademöglichkeiten = lademöglichkeiten;
exports.oil_price_2014 = oil_price_2014;
exports.mineralölsteuer = mineralölsteuer;
exports.deckungsbeitrag = deckungsbeitrag;
exports.mehrwertsteuer = mehrwertsteuer;
exports.price_per_barrel = price_per_barrel;
exports.electricity_prices = electricity_prices;
exports.verbrauchsentwicklung = verbrauchsentwicklung;
exports.price_of_lubricant = price_of_lubricant;
exports.hubraum = hubraum;
exports.verbrauch = verbrauch;
exports.versicherung = versicherung;
exports.kfzsteuer = kfzsteuer;
exports.untersuchung = untersuchung;
exports.faktor_BEV = faktor_BEV;
exports.reperaturkosten = reperaturkosten;
exports.co2_emissions = co2_emissions;
exports.traffic_multiplicator = traffic_multiplicator;