import fetch from 'cross-fetch'
import cors from 'cors'
import bodyParser from 'body-parser'
//import * as firebase from 'firebase-admin';
import moment from 'moment'

/* var serviceAccount = require('./serviceAccountKey.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://bikesantiago-275bf.firebaseio.com'
});

var db = firebase.database();
var ref = db.ref();
ref.once("value", function (snapshot) {
    //console.log(snapshot.val());
});

const stationsdb = ref.child('stations') */

var express = require('express');
var app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/get', (req, res) => {
    console.time('time to get stations')

    fetch('http://api.citybik.es/v2/networks/bikesantiago')
        .then(resp => resp.json())
        .then(response => {
            if (response && response.network && response.network.stations) {
                console.timeEnd('time to get stations')

                let stations = response.network.stations;

                // ADD TO FIREBASE DATABASE
                //stationsdb.push(stations)

                const sortby = req.query.sortby;
                const filter = req.query.filter;

                switch (sortby) {
                    case 'name':
                        stations.sort(sortBy('name'));
                        break;
                    case 'empty_slots':
                        stations.sort(sortBy('empty_slots'));
                        break;
                    case 'free_bikes':
                        stations.sort(sortBy('free_bikes'));
                        break;
                    default:
                        break;
                }

                if(filter){
                    stations = stations.filter((station) => {
                        //console.log('station', station)
                        return station.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1 || 
                            station.extra.address.toLowerCase().indexOf(filter.toLowerCase()) !== -1
                    })
                }

                //console.log('stations', stations)

                res.send(stations)
            } else {
                res.send([]);
            }
        })
        .catch(error => {
            console.log('ERROR', error)
            res.send(error)
        })
});

app.listen(3001, () => {
    console.log('Example app listening on port 3001!');
});

/**
 * @description
 * Returns a function which will sort an
 * array of objects by the given key.
 *
 * @param  {String}  key
 * @param  {Boolean} reverse
 * @return {Function}
 */
const sortBy = (key, reverse) => {

    // Move smaller items towards the front
    // or back of the array depending on if
    // we want to sort the array in reverse
    // order or not.
    const moveSmaller = reverse ? 1 : -1;

    // Move larger items towards the front
    // or back of the array depending on if
    // we want to sort the array in reverse
    // order or not.
    const moveLarger = reverse ? -1 : 1;

    /**
     * @param  {*} a
     * @param  {*} b
     * @return {Number}
     */
    return (a, b) => {
        if (a[key] < b[key]) {
            return moveSmaller;
        }
        if (a[key] > b[key]) {
            return moveLarger;
        }
        return 0;
    };
};