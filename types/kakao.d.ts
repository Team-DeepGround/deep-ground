declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: any) => Map
        LatLng: new (lat: number, lng: number) => LatLng
        Size: new (width: number, height: number) => Size
        Point: new (x: number, y: number) => Point
        Marker: new (options: any) => Marker
        MarkerImage: new (src: string, size: any, options?: any) => MarkerImage
        CustomOverlay: new (options: any) => CustomOverlay
        event: {
          addListener: (target: any, type: string, handler: Function) => void
        }
      }
    }
  }
}

declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: any)
  }
  
  class LatLng {
    constructor(lat: number, lng: number)
  }
  
  class Size {
    constructor(width: number, height: number)
  }
  
  class Point {
    constructor(x: number, y: number)
  }
  
  class Marker {
    constructor(options: any)
    setMap(map: Map | null): void
    setImage(image: any): void
    normalImage?: any
    cafeData?: any
    selectedMarker?: Marker
    normalMarker?: Marker
  }
  
  class MarkerImage {
    constructor(src: string, size: Size, options?: any)
  }
  
  class CustomOverlay {
    constructor(options: any)
    setMap(map: Map | null): void
  }
  
  namespace event {
    function addListener(target: any, type: string, handler: Function): void
  }
}

export {} 