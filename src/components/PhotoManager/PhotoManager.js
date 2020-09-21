import React, { Component } from 'react';
import { Button, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { uploadToAzureStorage } from './AzureUtil';
 
 class PhotoManager extends Component {

  state = {
    photos: [],
  }

  _handleButtonPress = async() => {
    let { status } = await MediaLibrary.requestPermissionsAsync();
    let media = await MediaLibrary.getAssetsAsync({
      mediaType: ['photo'],
    })
    let photo = await MediaLibrary.getAssetInfoAsync(media.assets[0]);

    console.log(photo);
    let photos = [...this.state.photos];
    photos.push(photo);
    this.setState({photos});
  };

  render() {
    return (
      <View>
        <Button title="Load Images" onPress={this._handleButtonPress} />
        <ScrollView>
          {this.state.photos.map((p, i) => {
            return (
              <TouchableOpacity
                key={i}
                onPress={async () => {
                  console.log("Trying to upload a photo");
                  uploadToAzureStorage(p.uri, "img");
                }}
              >
                <Image
                  //key={i}
                  style={{
                    width: 300,
                    height: 100,
                  }}
                  source={{ uri: p.uri }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

export default PhotoManager;