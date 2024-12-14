import React, { useState, useEffect, useRef } from "react";
import mqtt, { MqttClient, IClientOptions } from "mqtt";

const MqttControl: React.FC = () => {
  const [ledState, setLedState] = useState<boolean>(false); // Состояние переключателя
  const mqttClient = useRef<MqttClient | null>(null); // Ссылка для хранения клиента MQTT

  // Настройки подключения
  const mqttOptions: IClientOptions = {
    username: "egr_up", // Имя пользователя для вашего MQTT сервера
    password: "4611205bB!", // Пароль
    protocol: "wss" as const, // WebSocket Secure, explicitly cast to MqttProtocol
  };

  useEffect(() => {
    // Подключение к брокеру при монтировании компонента
    mqttClient.current = mqtt.connect(
      "wss://e0f60c0f35814ab3821a3cd4f5a2da0b.s1.eu.hivemq.cloud:8884/mqtt",
      mqttOptions
    );

    // Обработка событий MQTT
    mqttClient.current.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    mqttClient.current.on("error", (err: Error) => {
      console.error("MQTT Connection error: ", err);
    });

    // Очистка соединения при размонтировании компонента
    return () => {
      if (mqttClient.current) {
        mqttClient.current.end();
        console.log("Disconnected from MQTT broker");
      }
    };
  }, []); // useEffect запускается только один раз при монтировании

  const sendMessage = (message: string): void => {
    if (mqttClient.current && mqttClient.current.connected) {
      mqttClient.current.publish("test/topic", message);
      setLedState(message === "1");
    } else {
      console.error("MQTT client is not connected");
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = e.target.checked;
    sendMessage(newState ? "1" : "0");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>MQTT LED Control</h1>
      <label style={{ fontSize: "18px", position: "relative", display: "inline-block" }}>
        <span>
          {/* {ledState ? "Turn OFF" : "Turn ON"} */}
        </span>
        <input
          type="checkbox"
          checked={ledState}
          onChange={handleSwitchChange}
          style={{
            appearance: "none",
            width: "60px",
            height: "30px",
            backgroundColor: ledState ? "#4CAF50" : "#FF0000",
            borderRadius: "30px",
            position: "relative",
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.3s",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: "40%",
            left: ledState ? "37px" : "7px",
            transform: "translateY(-50%)",
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            backgroundColor: "white",
            transition: "left 0.3s",
          }}
        />
      </label>
    </div>
  );
};

export default MqttControl;
