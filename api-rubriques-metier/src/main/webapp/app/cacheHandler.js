/**
 * This modules handle the cache module
 */
var logger = require('../logger.js');

function CacheHandler() {
    "use strict";

    this._cache = require('memory-cache');
    logger.getInstance().info("Creation de l'obejt cache "+this._cache)

    /**
     * Retourne l'objet cache
     */
    this.get = function(){
        return this._cache;
    }

    /**
     * Flush the cache
     * Returns an object displaying the state of the cache before and after the flush
     */
    this.flush = function(){
        var cacheState = {
            "old_state" : {},
            "new_state" : {}
        };

        // Cache avant le flush
        cacheState.old_state = {
            "size" : this._cache.size(),
            "hits" : this._cache.hits()
        };
        logger.getInstance().debug(JSON.stringify(cacheState.old_state));

        // Flush du cache
        this._cache.clear();
        
        // Cache après le flush
        cacheState.new_state = {
            "size" : this._cache.size(),
            "hits" : this._cache.hits()
        };

        logger.getInstance().debug(JSON.stringify(cacheState.new_state));

        return cacheState;
    }

    /**
     * Get the cache current state
     */
    this.getState = function(){
        
        var cacheState = {
            "size" : this._cache.size(),
            "hits" : this._cache.hits()
        };

        return cacheState;
    }
}

module.exports = CacheHandler;

