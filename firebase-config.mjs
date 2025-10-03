import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyDaCtcco2EBukDQLGAuy4Tivq3mH2ACsiQ",
  authDomain: "kaqvuchannels.firebaseapp.com",
  projectId: "kaqvuchannels",
  storageBucket: "kaqvuchannels.firebasestorage.app",
  messagingSenderId: "61955066743",
  appId: "1:61955066743:web:5783cefe44e82e19feef72"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class ChannelsFirestore {
  constructor() {
    this.docRef = doc(db, 'channels', 'data');
  }

async getChannelsData() {
  try {
    const docSnap = await getDoc(this.docRef);
    if (docSnap.exists()) {
      return docSnap.data().channelsData;
    } else {
      const defaultData = {
        1: [{
          "name": "Canal+ Sport 1",
          "url1": "https://sportio.cc/ssic/22",
          "url2": "https://strumyk.net/embed/22333",
          "url3": "https://thedaddy.top/embed/stream-48.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        2: [{
          "name": "Canal+ Sport 2",
          "url1": "https://thedaddy.top/embed/stream-73.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        3: [{
          "name": "Canal+ Sport 3",
          "url1": "https://strumyk.net/embed/796",
          "url2": "https://thedaddy.top/embed/stream-259.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        4: [{
          "name": "Canal+ Sport 4",
          "url1": "https://strumyk.net/embed/804",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        5: [{
          "name": "Canal+ Sport 5",
          "url1": "https://strumyk.net/embed/112",
          "url2": "https://thedaddy.top/embed/stream-75.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        6: [{
          "name": "Canal+ Extra 1",
          "url1": "https://strumyk.net/embed/7261",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        7: [{
          "name": "Canal+ Extra 2",
          "url1": "https://strumyk.net/embed/7263",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        8: [{
          "name": "Canal+ Extra 3",
          "url1": "https://strumyk.net/embed/7265",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        10: [{
          "name": "Eleven Sports 1",
          "url1": "https://strumyk.net/vip/65",
          "url2": "https://thedaddy.top/embed/stream-71.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        11: [{
          "name": "Eleven Sports 2",
          "url1": "https://strumyk.net/embed/575",
          "url2": "https://thedaddy.top/embed/stream-72.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        12: [{
          "name": "Eleven Sports 3",
          "url1": "https://strumyk.net/vip/78",
          "url2": "https://thedaddy.top/embed/stream-428.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        13: [{
          "name": "Eleven Sports 4",
          "url1": "https://strumyk.net/vip/79",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        14: [{
          "name": "Polsat Sport 1",
          "url1": "https://strumyk.net/embed/134",
          "url2": "https://thedaddy.top/embed/stream-47.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        15: [{
          "name": "Polsat Sport 2",
          "url1": "https://strumyk.net/embed/594",
          "url2": "https://thedaddy.top/embed/stream-50.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }],
        16: [{
          "name": "Polsat Sport Premium 1",
          "url1": "https://strumyk.net/embed/759",
          "country": "PL",
          "language": "Polski",
          "quality": "SUPER HD"
        }],
        17: [{
          "name": "Polsat Sport Premium 2",
          "url1": "https://strumyk.net/embed/760",
          "country": "PL",
          "language": "Polski",
          "quality": "SUPER HD"
        }],
        18: [{
          "name": "TVP Sport",
          "url1": "https://strumyk.net/embed/239",
          "url2": "https://thedaddy.top/embed/stream-128.php",
          "country": "PL",
          "language": "Polski",
          "quality": "ULTRA HD"
        }]
      };
      await this.saveChannelsData(defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error('Błąd pobierania danych z Firestore:', error);
    throw error;
  }
}

  async saveChannelsData(channelsData) {
    try {
      await setDoc(this.docRef, { channelsData }, { merge: true });
      return true;
    } catch (error) {
      console.error('Błąd zapisywania danych do Firestore:', error);
      throw error;
    }
  }

  async deleteChannel(channelId) {
    try {
      const docSnap = await getDoc(this.docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().channelsData;
        delete data[channelId];
        await setDoc(this.docRef, { channelsData: data });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Błąd usuwania kanału z Firestore:', error);
      throw error;
    }
  }
}

window.channelsFirestore = new ChannelsFirestore();