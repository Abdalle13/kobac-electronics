// Somali cities and their districts (degmooyin), used by the checkout address form.
// Cities are grouped by region so the dropdown stays readable.
const somaliLocations = {
  'Muqdisho (Mogadishu)': [
    'Abdiaziz', 'Bondhere', 'Daynile', 'Dharkenley', 'Hamar Jajab', 'Hamar Weyne',
    'Heliwa', 'Hodan', 'Howl Wadag', 'Kaxda', 'Karan', 'Shangani', 'Shibis',
    'Waberi', 'Wadajir', 'Wardhigley', 'Yaqshid',
  ],
  'Hargeisa': [
    '26 June', 'Ahmed Dhagah', "Ga'an Libah", 'Ibrahim Koodbuur', 'Mohamoud Haybe',
    'Mohamed Mooge', 'New Hargeisa', 'Ayaha',
  ],
  'Kismayo (Kismaayo)': ['Alanley', 'Calanley', 'Fanole', 'Farjano', 'Gulwade', 'Shaqaalaha'],
  'Baidoa (Baydhabo)': ['Berdaale', 'Howl Wadag', 'Isha'],
  'Bosaso (Boosaaso)': ['Bosaso Central', 'Waberi', 'Batalaale', 'Guri Samo'],
  'Galkayo (Gaalkacyo)': ['Garsoor', 'Israac', 'Wadajir', 'Horumar'],
  'Beledweyne': ['Bundaweyn', 'Howl Wadag', 'Koshin', 'Ceela Jaale'],
  'Garoowe': ['Waberi', 'Israac', 'Hodan', 'Jesira'],
  'Burco (Burao)': ['26 June', 'Waaberi', "Sh. Bilal", 'Gooni'],
  'Berbera': ['Berbera Central', 'Darole', 'Shacab'],
  'Borama (Boorama)': ['Borama Central', 'Sheikh Ali Jowhar', 'Dilla'],
  'Ceerigaabo (Erigavo)': ['Erigavo Central', 'Dabatag'],
  'Laascaanood (Las Anod)': ['Las Anod Central', 'Yagoori'],
  'Qardho': ['Qardho Central'],
  'Marka (Merca)': ['Marka Central', 'Shalambood'],
  'Afgooye': ['Afgooye Central', 'Lafoole'],
  'Jowhar': ['Jowhar Central', 'Buulo Sheikh'],
  'Balcad': ['Balcad Central'],
  'Wanlaweyn': ['Wanlaweyn Central'],
  'Dhuusamareeb': ['Dhuusamareeb Central'],
  'Cadaado': ['Cadaado Central'],
  'Baraawe': ['Baraawe Central'],
  'Jamaame': ['Jamaame Central'],
  'Buulobarde': ['Buulobarde Central'],
  'Xudur': ['Xudur Central'],
  'Ceel Buur': ['Ceel Buur Central'],
  'Cadale': ['Cadale Central'],
};

export const somaliCities = Object.keys(somaliLocations);
export const districtsFor = (city) => somaliLocations[city] || [];

export default somaliLocations;
