"use client";

import React, { useContext, createContext } from 'react';

const DataContext = createContext({});

const CommerceFallbackContext = createContext(null);

const PlpCommercePrefetchContext = createContext(null);

export function useDataContext() {
  return useContext(DataContext);
}

/** SSR-prefetched commerce product when there is no Contentstack PDP entry. */
export function useCommerceFallback() {
  return useContext(CommerceFallbackContext);
}

/** SSR-prefetched PLP category, products, and filters for the current category URL. */
export function usePlpCommercePrefetch() {
  return useContext(PlpCommercePrefetchContext);
}

export default function DataContextProvider({ data, commerceFallback = null, plpCommercePrefetch = null, children }) {
  return (
    <DataContext.Provider value={data}>
      <CommerceFallbackContext.Provider value={commerceFallback}>
        <PlpCommercePrefetchContext.Provider value={plpCommercePrefetch}>
          {children}
        </PlpCommercePrefetchContext.Provider>
      </CommerceFallbackContext.Provider>
    </DataContext.Provider>
  );
}