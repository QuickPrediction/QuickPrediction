import * as tf from '@tensorflow/tfjs';

    const [predictionProbabilities, setPredictionProbabilities] = useState({
	    up: null,
	    down: null,
    });
  
    const trainAndPredict = async () => {
	if (chartPrices.length === 0) {
	    console.log('The chart price data is empty. Skipping prediction.');
	    return;
	}
	    console.log('Data to be used:', chartPrices);
	    const maxPrice = Math.max(...chartPrices);
	    const normalizedPrices = chartPrices.map(price => price / maxPrice);
  	    console.log('Normalized data:', normalizedPrices);
	    const model = tf.sequential();
	    model.add(tf.layers.dense({ units: 8, inputShape: [1], activation: 'relu' }));
	    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));
	    model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
	    console.log('The model has been built.');
	    const xs = tf.tensor2d(normalizedPrices.slice(0, -1).map(p => [p]));
	    const ys = tf.tensor2d(
	        normalizedPrices.slice(1).map((p, i) => {
		        const prevPrice = normalizedPrices[i];
		        return p > prevPrice ? [1, 0] : [0, 1];
	        })
	    );
	    console.log('Training data (xs):', xs.arraySync());
	    console.log('Training data (ys):', ys.arraySync());
	    console.log('Starting model training...');
	    await model.fit(xs, ys, {
	        epochs: 20,
	        callbacks: {
		        onEpochEnd: (epoch, logs) => {
		            console.log(`Epoch: ${epoch + 1} / 20 - Loss: ${logs.loss}`);
		        },
	        },
	    });
	    console.log('Model training completed.');
	    const lastPrice = normalizedPrices[normalizedPrices.length - 1];
	    const prediction = model.predict(tf.tensor2d([[lastPrice]])).dataSync();
 	    const probabilityUp = (prediction[0] * 100).toFixed(2);
	    const probabilityDown = (prediction[1] * 100).toFixed(2);
	    console.log('Probability of the next price going up:', `${probabilityUp}%`);
	    console.log('Probability of the next price going down:', `${probabilityDown}%`);
	    setPredictionProbabilities({
	        up: probabilityUp,
	        down: probabilityDown,
	    });
    };