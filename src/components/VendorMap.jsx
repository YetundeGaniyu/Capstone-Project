import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export function VendorMap({ latitude, longitude, title }) {
  const containerRef = useRef(null)
  const [loaded, setLoaded] = useState(typeof window !== 'undefined' && window.google?.maps)

  useEffect(() => {
    if (!API_KEY || loaded) return
    if (window.google?.maps) {
      setLoaded(true)
      return
    }
    const callbackName = '__artisanConnectMapsCallback'
    window[callbackName] = () => setLoaded(true)
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&callback=${callbackName}`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
    return () => {
      delete window[callbackName]
    }
  }, [loaded])

  useEffect(() => {
    if (!loaded || !window.google?.maps || !containerRef.current) return
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    const center = { lat, lng }
    const map = new window.google.maps.Map(containerRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      fullscreenControl: true,
    })
    new window.google.maps.Marker({
      position: center,
      map,
      title: title || 'Vendor location',
    })
  }, [loaded, latitude, longitude, title])

  if (!API_KEY) {
    return (
      <div className="vendor-map vendor-map-fallback">
        <p>Map unavailable. Set VITE_GOOGLE_MAPS_API_KEY to enable.</p>
      </div>
    )
  }

  const hasCoords = !Number.isNaN(Number(latitude)) && !Number.isNaN(Number(longitude))
  if (!hasCoords) return null

  return <div ref={containerRef} className="vendor-map" aria-label="Vendor location map" />
}
