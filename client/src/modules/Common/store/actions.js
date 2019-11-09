import superagent from "superagent";

const baseUrl = process.env.VUE_APP_API;

export default {
  async getChannels({ commit }) {
    try {
      const { body } = await superagent.get(`${baseUrl}/channels.json`);
      commit("setChannels", body);
    } catch (e) {
      console.log(e);
    }
  }
};
