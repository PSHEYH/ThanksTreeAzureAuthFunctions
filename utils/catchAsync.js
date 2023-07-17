module.exports = (fn) => {
    return (context) => { fn(context).catch(e => context.next(e)) };
};