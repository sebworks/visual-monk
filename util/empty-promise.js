
module.exports = () => {

  const promise = new Promise( ( resolve, reject ) => {
    promise.resolve = resolve;
    promise.reject = reject;
  } );

  return promise
}
