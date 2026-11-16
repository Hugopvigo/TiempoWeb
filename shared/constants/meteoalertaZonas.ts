import type { City } from "../types/weather";

// Zonas de aviso del Plan Meteoalerta (AEMET, Anexo 1 "Umbrales y niveles de
// aviso", v1 31-may-2022), con la provincia a la que pertenecen. Generado a partir
// del PDF oficial; el nombre coincide con el <areaDesc> de los avisos CAP.
// Baleares y Canarias: el anexo agrupa por isla; aquí la provincia es la real.
export interface MeteoalertaZona {
  code: string;
  name: string;
  province: string;
}

export const METEOALERTA_ZONAS: MeteoalertaZona[] = [
  { code: "610401", name: "Valle del Almanzora y Los Vélez", province: "Almería" },
  { code: "610402", name: "Nacimiento y Campo de Tabernas", province: "Almería" },
  { code: "610403", name: "Poniente y Almería Capital", province: "Almería" },
  { code: "610404", name: "Levante almeriense", province: "Almería" },
  { code: "611101", name: "Grazalema", province: "Cádiz" },
  { code: "611102", name: "Campiña gaditana", province: "Cádiz" },
  { code: "611103", name: "Litoral gaditano", province: "Cádiz" },
  { code: "611104", name: "Estrecho", province: "Cádiz" },
  { code: "611401", name: "Sierra y Pedroches", province: "Córdoba" },
  { code: "611402", name: "Campiña cordobesa", province: "Córdoba" },
  { code: "611403", name: "Subbética cordobesa", province: "Córdoba" },
  { code: "611801", name: "Cuenca del Genil", province: "Granada" },
  { code: "611802", name: "Guadix y Baza", province: "Granada" },
  { code: "611803", name: "Nevada y Alpujarras", province: "Granada" },
  { code: "611804", name: "Costa granadina", province: "Granada" },
  { code: "612101", name: "Aracena", province: "Huelva" },
  { code: "612102", name: "Andévalo y Condado", province: "Huelva" },
  { code: "612103", name: "Litoral de Huelva", province: "Huelva" },
  { code: "612301", name: "Morena y Condado", province: "Jaén" },
  { code: "612302", name: "Cazorla y Segura", province: "Jaén" },
  { code: "612303", name: "Valle del Guadalquivir de Jaén", province: "Jaén" },
  { code: "612304", name: "Capital y Montes de Jaén", province: "Jaén" },
  { code: "612901", name: "Antequera", province: "Málaga" },
  { code: "612902", name: "Ronda", province: "Málaga" },
  { code: "612903", name: "Sol y Guadalhorce", province: "Málaga" },
  { code: "612904", name: "Axarquía", province: "Málaga" },
  { code: "614101", name: "Sierra norte de Sevilla", province: "Sevilla" },
  { code: "614102", name: "Campiña sevillana", province: "Sevilla" },
  { code: "614103", name: "Sierra sur de Sevilla", province: "Sevilla" },
  { code: "622201", name: "Pirineo oscense", province: "Huesca" },
  { code: "622202", name: "Centro de Huesca", province: "Huesca" },
  { code: "622203", name: "Sur de Huesca", province: "Huesca" },
  { code: "624401", name: "Albarracín y Jiloca", province: "Teruel" },
  { code: "624402", name: "Gúdar y Maestrazgo", province: "Teruel" },
  { code: "624403", name: "Bajo Aragón de Teruel", province: "Teruel" },
  { code: "625001", name: "Cinco Villas de Zaragoza", province: "Zaragoza" },
  { code: "625002", name: "Ibérica zaragozana", province: "Zaragoza" },
  { code: "625003", name: "Ribera del Ebro de Zaragoza", province: "Zaragoza" },
  { code: "633301", name: "Litoral occidental asturiano", province: "Asturias" },
  { code: "633302", name: "Litoral oriental asturiano", province: "Asturias" },
  { code: "633303", name: "Suroccidental asturiana", province: "Asturias" },
  { code: "633304", name: "Central y Valles Mineros", province: "Asturias" },
  { code: "633305", name: "Cordillera y Picos de Europa", province: "Asturias" },
  { code: "645301", name: "Ibiza y Formentera", province: "Illes Balears" },
  { code: "645401", name: "Sierra Tramontana", province: "Illes Balears" },
  { code: "645402", name: "Norte y nordeste de Mallorca", province: "Illes Balears" },
  { code: "645403", name: "Interior de Mallorca", province: "Illes Balears" },
  { code: "645404", name: "Sur de Mallorca", province: "Illes Balears" },
  { code: "645405", name: "Levante mallorquín", province: "Illes Balears" },
  { code: "645501", name: "Menorca", province: "Illes Balears" },
  { code: "659001", name: "Norte de Gran Canaria", province: "Las Palmas" },
  { code: "659003", name: "Cumbres de Gran Canaria", province: "Las Palmas" },
  { code: "659004", name: "Este, sur y oeste de Gran Canaria", province: "Las Palmas" },
  { code: "659101", name: "Lanzarote", province: "Las Palmas" },
  { code: "659201", name: "Fuerteventura", province: "Las Palmas" },
  { code: "659302", name: "Cumbres de la Palma", province: "Santa Cruz de Tenerife" },
  { code: "659303", name: "Este de la Palma", province: "Santa Cruz de Tenerife" },
  { code: "659304", name: "Oeste de la Palma", province: "Santa Cruz de Tenerife" },
  { code: "659401", name: "La Gomera", province: "Santa Cruz de Tenerife" },
  { code: "659501", name: "El Hierro", province: "Santa Cruz de Tenerife" },
  { code: "659601", name: "Norte de Tenerife", province: "Santa Cruz de Tenerife" },
  { code: "659602", name: "Área Metropolitana de Tenerife", province: "Santa Cruz de Tenerife" },
  { code: "659603", name: "Este, sur y oeste de Tenerife", province: "Santa Cruz de Tenerife" },
  { code: "663901", name: "Litoral cántabro", province: "Cantabria" },
  { code: "663902", name: "Liébana", province: "Cantabria" },
  { code: "663903", name: "Centro y valle de Villaverde", province: "Cantabria" },
  { code: "663904", name: "Cantabria del Ebro", province: "Cantabria" },
  { code: "670501", name: "Meseta de Ávila", province: "Ávila" },
  { code: "670502", name: "Sistema Central de Ávila", province: "Ávila" },
  { code: "670503", name: "Sur de Ávila", province: "Ávila" },
  { code: "670901", name: "Cordillera Cantábrica de Burgos", province: "Burgos" },
  { code: "670902", name: "Norte de Burgos", province: "Burgos" },
  { code: "670903", name: "Condado de Treviño", province: "Burgos" },
  { code: "670904", name: "Meseta de Burgos", province: "Burgos" },
  { code: "670905", name: "Ibérica de Burgos", province: "Burgos" },
  { code: "672401", name: "Cordillera Cantábrica de León", province: "León" },
  { code: "672402", name: "Bierzo de León", province: "León" },
  { code: "672403", name: "Meseta de León", province: "León" },
  { code: "673401", name: "Cordillera Cantábrica de Palencia", province: "Palencia" },
  { code: "673402", name: "Meseta de Palencia", province: "Palencia" },
  { code: "673701", name: "Meseta de Salamanca", province: "Salamanca" },
  { code: "673702", name: "Sistema Central de Salamanca", province: "Salamanca" },
  { code: "673703", name: "Sur de Salamanca", province: "Salamanca" },
  { code: "674001", name: "Meseta de Segovia", province: "Segovia" },
  { code: "674002", name: "Sistema Central de Segovia", province: "Segovia" },
  { code: "674201", name: "Ibérica de Soria", province: "Soria" },
  { code: "674202", name: "Meseta de Soria", province: "Soria" },
  { code: "674203", name: "Sistema Central de Soria", province: "Soria" },
  { code: "674701", name: "Meseta de Valladolid", province: "Valladolid" },
  { code: "674901", name: "Sanabria", province: "Zamora" },
  { code: "674902", name: "Meseta de Zamora", province: "Zamora" },
  { code: "680201", name: "La Mancha albaceteña", province: "Albacete" },
  { code: "680202", name: "Alcaraz y Segura", province: "Albacete" },
  { code: "680203", name: "Hellín y Almansa", province: "Albacete" },
  { code: "681301", name: "Montes del norte y Anchuras", province: "Ciudad Real" },
  { code: "681302", name: "La Mancha de Ciudad Real", province: "Ciudad Real" },
  { code: "681303", name: "Valle del Guadiana", province: "Ciudad Real" },
  { code: "681304", name: "Sierras de Alcudia y Madrona", province: "Ciudad Real" },
  { code: "681601", name: "Alcarria conquense", province: "Cuenca" },
  { code: "681602", name: "Serranía de Cuenca", province: "Cuenca" },
  { code: "681603", name: "La Mancha conquense", province: "Cuenca" },
  { code: "681901", name: "Serranía de Guadalajara", province: "Guadalajara" },
  { code: "681902", name: "Parameras de Molina", province: "Guadalajara" },
  { code: "681903", name: "Alcarria de Guadalajara", province: "Guadalajara" },
  { code: "684501", name: "Sierra de San Vicente", province: "Toledo" },
  { code: "684502", name: "Valle del Tajo", province: "Toledo" },
  { code: "684503", name: "Montes de Toledo", province: "Toledo" },
  { code: "684504", name: "La Mancha toledana", province: "Toledo" },
  { code: "690801", name: "Prepirineo de Barcelona", province: "Barcelona" },
  { code: "690802", name: "Depresión central de Barcelona", province: "Barcelona" },
  { code: "690803", name: "Prelitoral de Barcelona", province: "Barcelona" },
  { code: "690804", name: "Litoral de Barcelona", province: "Barcelona" },
  { code: "691701", name: "Pirineo de Girona y Llivia", province: "Girona" },
  { code: "691702", name: "Prelitoral de Girona", province: "Girona" },
  { code: "691703", name: "Ampurdán", province: "Girona" },
  { code: "691704", name: "Litoral sur de Girona", province: "Girona" },
  { code: "692501", name: "Valle de Arán", province: "Lleida" },
  { code: "692502", name: "Pirineo de Lleida", province: "Lleida" },
  { code: "692503", name: "Depresión central de Lleida", province: "Lleida" },
  { code: "694301", name: "Depresión central de Tarragona", province: "Tarragona" },
  { code: "694302", name: "Prelitoral norte de Tarragona", province: "Tarragona" },
  { code: "694305", name: "Prelitoral sur de Tarragona", province: "Tarragona" },
  { code: "694303", name: "Litoral norte de Tarragona", province: "Tarragona" },
  { code: "694304", name: "Litoral sur de Tarragona", province: "Tarragona" },
  { code: "700601", name: "Vegas del Guadiana", province: "Badajoz" },
  { code: "700602", name: "La Siberia extremeña", province: "Badajoz" },
  { code: "700603", name: "Barros y Serena", province: "Badajoz" },
  { code: "700604", name: "Sur de Badajoz", province: "Badajoz" },
  { code: "701001", name: "Norte de Cáceres", province: "Cáceres" },
  { code: "701002", name: "Tajo y Alagón", province: "Cáceres" },
  { code: "701003", name: "Meseta cacereña", province: "Cáceres" },
  { code: "701004", name: "Villuercas y Montánchez", province: "Cáceres" },
  { code: "711501", name: "Noroeste de A Coruña", province: "A Coruña" },
  { code: "711502", name: "Oeste de A Coruña", province: "A Coruña" },
  { code: "711503", name: "Interior de A Coruña", province: "A Coruña" },
  { code: "711504", name: "Suroeste de A Coruña", province: "A Coruña" },
  { code: "712701", name: "A Mariña", province: "Lugo" },
  { code: "712702", name: "Centro de Lugo", province: "Lugo" },
  { code: "712703", name: "Montaña de Lugo", province: "Lugo" },
  { code: "712704", name: "Sur de Lugo", province: "Lugo" },
  { code: "713201", name: "Noroeste de Ourense", province: "Ourense" },
  { code: "713202", name: "Miño de Ourense", province: "Ourense" },
  { code: "713203", name: "Sur de Ourense", province: "Ourense" },
  { code: "713204", name: "Montaña de Ourense", province: "Ourense" },
  { code: "713205", name: "Valdeorras", province: "Ourense" },
  { code: "713601", name: "Rias Baixas", province: "Pontevedra" },
  { code: "713602", name: "Interior de Pontevedra", province: "Pontevedra" },
  { code: "713603", name: "Miño de Pontevedra", province: "Pontevedra" },
  { code: "722801", name: "Sierra de Madrid", province: "Madrid" },
  { code: "722802", name: "Metropolitana y Henares", province: "Madrid" },
  { code: "722803", name: "Sur, Vegas y Oeste", province: "Madrid" },
  { code: "733001", name: "Altiplano de Murcia", province: "Murcia" },
  { code: "733002", name: "Noroeste de Murcia", province: "Murcia" },
  { code: "733003", name: "Vega del Segura", province: "Murcia" },
  { code: "733004", name: "Valle del Guadalentín, Lorca y Águilas", province: "Murcia" },
  { code: "733005", name: "Campo de Cartagena y Mazarrón", province: "Murcia" },
  { code: "743101", name: "Vertiente Cantábrica de Navarra", province: "Navarra" },
  { code: "743102", name: "Centro de Navarra", province: "Navarra" },
  { code: "743103", name: "Pirineo navarro", province: "Navarra" },
  { code: "743104", name: "Ribera del Ebro de Navarra", province: "Navarra" },
  { code: "750101", name: "Cuenca del Nervión", province: "Álava" },
  { code: "750102", name: "Llanada alavesa", province: "Álava" },
  { code: "750103", name: "Rioja alavesa", province: "Álava" },
  { code: "752001", name: "Gipuzkoa litoral", province: "Gipuzkoa" },
  { code: "752002", name: "Gipuzkoa interior", province: "Gipuzkoa" },
  { code: "754801", name: "Bizkaia litoral", province: "Bizkaia" },
  { code: "754802", name: "Bizkaia interior", province: "Bizkaia" },
  { code: "762601", name: "Ribera del Ebro de La Rioja", province: "La Rioja" },
  { code: "762602", name: "Ibérica riojana", province: "La Rioja" },
  { code: "770301", name: "Litoral norte de Alicante", province: "Alicante" },
  { code: "770302", name: "Interior de Alicante", province: "Alicante" },
  { code: "770303", name: "Litoral sur de Alicante", province: "Alicante" },
  { code: "771201", name: "Interior norte de Castellón", province: "Castellón" },
  { code: "771202", name: "Litoral norte de Castellón", province: "Castellón" },
  { code: "771203", name: "Interior sur de Castellón", province: "Castellón" },
  { code: "771204", name: "Litoral sur de Castellón", province: "Castellón" },
  { code: "774601", name: "Interior norte de Valencia", province: "Valencia" },
  { code: "774602", name: "Litoral norte de Valencia", province: "Valencia" },
  { code: "774603", name: "Interior sur de Valencia", province: "Valencia" },
  { code: "774604", name: "Litoral sur de Valencia", province: "Valencia" },
  { code: "785101", name: "Ceuta", province: "Ceuta" },
  { code: "795201", name: "Melilla", province: "Melilla" },
];

function norm(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// "Provincia de Sevilla", "Província de Lérida", "Ciudad Autónoma de Ceuta" → "sevilla", "lerida", "ceuta".
// No se quitan artículos: "La Rioja" y "Las Palmas" los llevan en el nombre.
function normProvince(s: string): string {
  return norm(s).replace(/^(provincia|ciudad autonoma|comunidad autonoma) (de|del) /, "");
}

// Equivalencias entre lo que devuelve la geocodificación y la provincia del anexo.
const PROVINCE_ALIASES: Record<string, string> = {
  "vizcaya": "Bizkaia",
  "guipuzcoa": "Gipuzkoa",
  "araba": "Álava",
  "la coruna": "A Coruña",
  "coruna": "A Coruña",
  "orense": "Ourense",
  "gerona": "Girona",
  "lerida": "Lleida",
  "castellon de la plana": "Castellón",
  "castello": "Castellón",
  "alacant": "Alicante",
  "las islas baleares": "Illes Balears",
  "islas baleares": "Illes Balears",
  "baleares": "Illes Balears",
};

/** Nombres de zona Meteoalerta de la provincia de una ciudad; vacío si no se conoce. */
export function zoneNamesForProvince(admin2: string | undefined): string[] {
  const wanted = provinceKey(admin2);
  if (!wanted) return [];
  return METEOALERTA_ZONAS.filter((z) => norm(z.province) === wanted).map((z) => z.name);
}

/**
 * Clave canónica de provincia: sin acentos, en minúsculas y con los prefijos
 * que usa cada fuente eliminados ("Provincia de La Coruña" → "la coruna",
 * "Bizkaia" → "bizkaia"). Es la misma clave con la que se indexan las zonas.
 */
export function provinceKey(admin2: string | undefined): string {
  if (!admin2) return "";
  const key = normProvince(admin2);
  return norm(PROVINCE_ALIASES[key] ?? key);
}

/** Provincia de una zona Meteoalerta por su nombre; vacío si no existe. */
export function zoneProvinceKey(zoneName: string): string {
  const zone = METEOALERTA_ZONAS.find((z) => norm(z.name) === norm(zoneName));
  return zone ? norm(zone.province) : "";
}

export function zoneNamesForCity(city: City): string[] {
  return zoneNamesForProvince(city.admin2);
}
