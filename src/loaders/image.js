var imageStatuses = {}
var images = {}

class ImageLoader {
  onload () {}

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
      image.onload = () => {
        imageStatuses[url] = ImageLoader.IMAGE_STATUS_LOADED
        images[url] = image
        this.onload()
      }
      image.src = url
    }
  }
}

ImageLoader.prototype.IMAGE_STATUS_LOADING = ImageLoader.IMAGE_STATUS_LOADING = 1
ImageLoader.prototype.IMAGE_STATUS_LOADED = ImageLoader.IMAGE_STATUS_LOADED = 2

export default ImageLoader
