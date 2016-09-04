var imageStatuses = {}
var images = {}

class ImageLoader {
  getImage (url) {
    return images[url]
  }

  getStatus (url) {
    return imageStatuses[url]
  }

  load (url) {
    var status = this.getStatus(url)
    if (status !== ImageLoader.IMAGE_STATUS_LOADING && status !== ImageLoader.IMAGE_STATUS_LOADED) {
      imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADING
      var image = new window.Image()
      image.onload = function onload () {
        imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADED
        images[url] = this
      }
      image.src = url
    }
  }
}

ImageLoader.IMAGE_STATUS_LOADING = 1
ImageLoader.IMAGE_STATUS_LOADED = 2

export default ImageLoader
