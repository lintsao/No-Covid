import {React, useState, useEffect} from "react";
import {Link} from "react-router-dom";
import loader from "../../api/map";
// Google Map Geolocation
import {geolocation} from 'api/geolocation';
import { Descriptions } from 'antd';
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import Header from "components/Header/Header.js";
import MyHeaderLinks from "components/Header/MyHeaderLink.js";
import Footer from "components/Footer/Footer.js";
import Button from "components/CustomButtons/Button.js";
import GridContainer from "components/Grid/GridContainer.js";
import GridItem from "components/Grid/GridItem.js";
import HeaderLinks from "components/Header/HeaderLinks.js";
import Parallax from "components/Parallax/Parallax.js";
import profile from "assets/img/faces/christian.jpg";
import styles from "assets/jss/material-kit-react/views/profilePage.js";

const useStyles = makeStyles(styles);

export default function ConfirmDeliveryPage(props) {
  const classes = useStyles();
  const {web3, contract, ...rest} = props;
  const imageClasses = classNames(
    classes.imgRaised,
    classes.imgRoundedCircle,
    classes.imgFluid
  );
  // const navImageClasses = classNames(classes.imgRounded, classes.imgGallery);
  const [clientAddr, setClientAddr] = useState("");
  const [deliveryAddr, setDeliveryAddr] = useState("");
  const [deliveryIndex, setDeliveryIndex] = useState(0);
  const [FirstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [TravelOrNot, setTravelOrNot] = useState("");
  const [otherSymptom, setotherSymptom] = useState("");
  const [Contact, setContact] = useState("");
  const [Symptom, setSymptom] = useState("");
  const [Score, setScore] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState([]);
  const [clientLatitude, setLatitude] = useState(0);
  const [clientLongitude, setLongitude] = useState(0);
  const [confirmList, setConfirmList] = useState(null);
  const [deliveryLocationList, setDeliveryLocationList] = useState(null);

  const mapRender = () => {
  loader.load().then(() => {
    const map = new google.maps.Map(document.getElementById("mapConfirmDelivery"), {
      center: { lat: clientLatitude, lng: clientLongitude },
      zoom: 11,
    });

    var iconHome = {
      url: "https://imgur.com/Q2KsdLh.jpg", // url
      scaledSize: new google.maps.Size(30, 30), // size
    };

    var iconDanger = {
      url: 'https://imgur.com/CTZIgOo.jpg', // url
      scaledSize: new google.maps.Size(30, 30), // size
    };

    var iconSafe = {
      url: 'https://imgur.com/uRsoHo7.jpg',
      scaledSize: new google.maps.Size(30, 30), // size
    };

    var iconDelivery = {
      url: 'https://imgur.com/tYsXNec.jpg',
      scaledSize: new google.maps.Size(30, 30), // size
    };

    var iconRestaurant = {
      url: 'https://imgur.com/7Fjvw6D.jpg',
      scaledSize: new google.maps.Size(30, 30), // size
    };

    var data = [
      {
      position: { lat: clientLatitude, lng: clientLongitude },
      icon: iconHome,
      map: map
      },
      {
      position: { lat: 25.017896, lng: 121.532601 },
      icon: iconRestaurant,
      map: map
    }]

    console.log("deliveryLocationList in map:", deliveryLocationList, "confirmList in map", confirmList)
    if(confirmList !== null && deliveryLocationList !== null){
      console.log(confirmList.length, confirmList, deliveryLocationList.length, deliveryLocationList)
      if(confirmList.length !== 0 && deliveryLocationList.length !== 0){
      for (let i = 0; i < confirmList.length; i++) {
        if (deliveryLocationList[i] !== undefined && confirmList[i] !== undefined){
          console.log("deliveryLocation:", deliveryLocationList[i], "confirmList", confirmList[i])
          const location = { lat: deliveryLocationList[i][0], lng: deliveryLocationList[i][1] }
          if(confirmList[i]){
            data.push({
              position: location,
              icon: iconDanger,
              map: map
            });
          }else{
            data.push({
              position: location,
              icon: iconSafe,
              map: map
          });
          }
        }
        
      }
    }
    }
    console.log("data", data)
    for (let i= 0; i < data.length ; i++) {
      console.log(data[i])
      var marker = new google.maps.Marker(data[i]);
    }
  });
}

  const getLocation = () => {
    if (navigator.geolocation) {
      console.log("get position")
      navigator.geolocation.getCurrentPosition(setPosition);
    } else {
      console.log( "Geolocation is not supported by this browser")
    }
  }

  const setPosition = (position) => {
    setLatitude(position.coords.latitude)
    setLongitude(position.coords.longitude)
    console.log("Latitude: " + clientLatitude)
    console.log("Longitude: " + clientLongitude)
  }

  const getaccount = async () => {
    console.log(web3, contract)
    if(web3 !== null && contract !== null){
      const accountresult = await web3.eth.getAccounts(); // get accounts
      console.log("accountresult", accountresult);
      setClientAddr(accountresult[0]); // 第一個為 client
    }    
  }

  const getDelivery = async () => {
    if(web3 !== null && contract !== null){
      // get all delivery addres
      const deliveryList = await contract.methods.GetAllDeliver().call({from: clientAddr});
      console.log("deliveryList", deliveryList)
      const deliveryList_can_match = [];
      // find the deliveryMan isn't matched
      for (let i = 0; i < deliveryList.length; i++) {
        const deliveryMatch = await contract.methods.GetMatchedCustomer().call({from: deliveryList[i]})
        if ((deliveryMatch[0] === false)){
          deliveryList_can_match.push(deliveryList[i])
        }
      }
      setDeliveryInfo(deliveryList_can_match)
      console.log("deliveryList_can_match", deliveryList_can_match)
      // test
      console.log("there are", deliveryList_can_match.length, "available delivery men")
    }else{
      console.log("web3 or contract is null");
    }
  }

  const setUpMatch = () => {
    contract.methods.MatchWithDeliver(deliveryAddr).send({from: clientAddr});
  }

  const chooseNotDelivery = async () => {
    // deliveryIndex === 0 for initial
    console.log(deliveryIndex, "/", deliveryInfo.length)
    if(deliveryIndex < deliveryInfo.length) {
      // set delivery address
      const deliveryAddrTemp = deliveryInfo[deliveryIndex]
      console.log("deliveryAddrTemp", deliveryAddrTemp)
      // get delivery health status
      const deliveryHealth = await contract.methods.GetHealthStatus(deliveryAddrTemp).call({from: clientAddr})
      const deliveryHistory = await contract.methods.GetDeliverHistory(deliveryAddrTemp).call({from: clientAddr})
      var scores = []
      var scoresAvg = 0
      for(let i=0; i<deliveryHealth[8].length; i++){
        scores.push(parseInt(deliveryHealth[8][i]));
        scoresAvg += parseInt(deliveryHealth[8][i])
      }
      if(scores.length > 0){
        scoresAvg /= deliveryHealth[8].length
      }
      console.log("deliveryHistory", deliveryHistory)
      geolocation(deliveryHistory, setConfirmList, setDeliveryLocationList);
      console.log("deliveryHealth", deliveryHealth)
      setDeliveryAddr(deliveryAddrTemp)
      setFirstName(deliveryHealth[0]);
      setLastName(deliveryHealth[1]);
      setEmail(deliveryHealth[2]);
      setPhone(deliveryHealth[3]);
      if(deliveryHealth[4]){
        setTravelOrNot("True");
      }else{
        setTravelOrNot("False");
      }
      if(deliveryHealth[5]){
        setotherSymptom("True");
      }else{
        setotherSymptom("False");
      }
      if(deliveryHealth[6]){
        setContact("True");
      }else{
        setContact("False");
      }
      if(deliveryHealth[7]){
        setSymptom("True");
      }else{
        setSymptom("False");
      }
      if(scores.length > 0){
        setScore(scoresAvg);
      }else{
        setScore("No Data");
      }
      setDeliveryIndex(deliveryIndex + 1);
    }else{
      console.log(" no available delivery men")
    }
  }

  useEffect(() => { // 初始 render
    getLocation();
  }, [clientLatitude, clientLongitude]);

  useEffect(() => { // 初始 render
    console.log(confirmList, deliveryLocationList)
    if(confirmList === null || deliveryLocationList === null){
      mapRender();
    }else{
      if(confirmList.length !== deliveryLocationList.length){
        mapRender();
      }
    }
  }, [confirmList, deliveryLocationList]);

//   const interval = setInterval(() => {
//     console.log(confirmList, deliveryLocationList)
//     if(confirmList === null || deliveryLocationList === null){
//       mapRender();
//     }else{
//       if(confirmList.length !== deliveryLocationList.length){
//         mapRender();
//       }else{
//         clearInterval(interval)
//       }
//     }
// }, 5000);

  useEffect(() => { // 初始 render
    getaccount();
  }, [web3, contract]);

  useEffect(() => { // 初始 render
    getDelivery();
    // chooseNotDelivery();
  }, [web3, contract]);

  useEffect(() => { // 初始 render
    if(deliveryInfo.length !== 0){
      // for the first delivery
      chooseNotDelivery();
    }
  }, [deliveryInfo]);

  return (
    <div>
      <Header
        color="transparent"
        brand="Welcome to No-Covid"
        rightLinks={<MyHeaderLinks />}
        fixed
        changeColorOnScroll={{
          height: 200,
          color: "white",
        }}
        {...rest}
      />
      <Parallax
        small
        filter
        image={require("assets/img/profile-bg.jpg").default}
      />
      <div className={classNames(classes.main, classes.mainRaised)}>
        <div>
          <div className={classes.container}>
            <GridContainer justify="center">
              <GridItem xs={12} sm={12} md={6}>
                <div className={classes.profile}>
                  <div>
                    <img src={"https://img.88icon.com/download/jpg/20200902/7a76bdc81863c456fa4355fc9cd09b4f_512_512.jpg!88bg"} alt="..." className={imageClasses} />
                  </div>
                  <div className={classes.name}>
                    {!(deliveryInfo.length)?
                    <>
                      <h3 className={classes.title}>No available delivery man</h3>
                      <h6>Wait for a while and refresh this page later</h6>
                    </>
                    :
                    <>
                      <h3 className={classes.title}>{FirstName}</h3>
                      <h6>Delivery ID: {deliveryAddr}</h6>
                    </>             
                    }
                  </div>
                </div>
              </GridItem>
            </GridContainer>
            <div className={classes.description}>
              <p>
              </p>
            </div>
            <GridContainer justify="center">
            {!(deliveryInfo.length)?
              <></>
              :
              <>
                <Descriptions title="Info of your Delivery Man">
                  <Descriptions.Item label="Name">{FirstName}, {LastName}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{Phone}</Descriptions.Item>
                  <Descriptions.Item label="Email">{Email}</Descriptions.Item>
                  <Descriptions.Item label="TravelOrNot">{TravelOrNot}</Descriptions.Item>
                  <Descriptions.Item label="otherSymptom">{otherSymptom}</Descriptions.Item>
                  <Descriptions.Item label="Contact">{Contact}</Descriptions.Item>
                  <Descriptions.Item label="Symptom">{Symptom}</Descriptions.Item>
                  <Descriptions.Item label="Score">{Score}</Descriptions.Item>
                </Descriptions>
              </>             
            }
            </GridContainer>
            <br></br>
            <div id="mapConfirmDelivery"></div>
            <br></br>
            <GridContainer justify="center">
              <Button 
              size="sm" 
              color="success"
              // href="http://localhost:3000/clientAction"
              onClick ={()=> {
                setUpMatch();
              }}
              disabled={!(deliveryInfo.length)}
              >
              <Link to={(deliveryInfo.length) ? '/clientAction' : '#'} style={{color:"white"}}>
              Confirm my order 
              </Link>
              </Button>
            &nbsp; 
            <Button 
            size="sm" 
            color="rose"
            onClick ={()=> {
              chooseNotDelivery();
            }}
            disabled={!(deliveryIndex < deliveryInfo.length)}
            > Change another delivery man </Button>
            &nbsp;
            <Link to="/order">
              <Button 
              size="sm"
              // href="http://localhost:3000/order"
              > Cancel my order </Button>
            </Link>
            </GridContainer>
            <br></br>
          </div>
        </div>
      </div>
      {/* <Button
      onClick={()=>{
        console.log(confirm)
        contract.methods.UploadHealthStatus("co", "tsao", "ss", "09", true, true, true, true).send({from: "0x5108f6abF7464d70c59147De5333C9a0faF70677"})
      }
      }></Button>
      <Button
      onClick={()=>{
        comfirmGeolocation()
      }
      }></Button>
     <Button
      onClick={()=>{
        console.log("history")
        // contract.methods.FinishMatch("0x5108f6abF7464d70c59147De5333C9a0faF70677", "No. 16-1, Aly. 14, Ln. 283, Sec. 3, Roosevelt Rd., Da’an Dist., Taipei City, Taiwan").send({from: "0x5108f6abF7464d70c59147De5333C9a0faF70677"})
        contract.methods.FinishMatch("0x5108f6abF7464d70c59147De5333C9a0faF70677", "No.16, Sec. 2, Zhongshan N. Rd., Zhongshan Dist., Taipei City 104, Taiwan (R.O.C.)").send({from: "0x5108f6abF7464d70c59147De5333C9a0faF70677"})
      }
      }></Button> */}
      {/* <Footer /> */}
    </div>
  );
}
