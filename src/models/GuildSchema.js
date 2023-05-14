const { Schema, Model, model } = require("mongoose");

const guild_schema = new Schema({
    guildId: {
        type: String,
        required: false
    },
    destekSistem: {
        ticketType: {
            type: String,
            default: 0 // Disabled
        },
        ticketMessageId: {
            type: String,
            required: false
        },
        lastTicketId: {
            type: Number,
            default: 1  
        },
        channelId: {
            type: String,
            required: false
        },
        gorevliRole: {
            type: String,
            required: false
        },
        categories: {
            active: {
                type: String,
                required: false
            },
            archive: {
                type: String,
                required: false
            }
        },
        talepEmbed: {
            author: {
                name: {
                    type: String,
                    default: '{{guild_name}}'
                },
                iconURL: {
                    type: String,
                    default: '{{guild_icon}}'
                }
            },
            title: {
                type: String,
                default: 'Soft Cord | Destek Sistemi'
            },
            description: {
                type: String,
                default: 'Destek Ekibimiz en yakın sürede sizinle ilgilenecektir.\n\n> Talep Sebebi: {{reason}}'
            },
            footer: {
                text: {
                    type: String,
                    required: false
                },
                iconURL: {
                    type: String,
                    required: false
                }
            },
            color: {
                type: String,
                required: false
            }
        },
        embed: {
            author: {
                name: {
                    type: String,
                    default: '{{guild_name}}'
                },
                iconURL: {
                    type: String,
                    default: '{{guild_icon}}'
                }
            },
            title: {
                type: String,
                default: 'Soft Cord | Destek Sistemi'
            },
            description: {
                type: String,
                default: 'Lütfen destek talebi oluşturmak "🎫" tıklayın.'
            },
            footer: {
                text: {
                    type: String,
                    required: false
                },
                iconURL: {
                    type: String,
                    required: false
                }
            },
            color: {
                type: String,
                required: false
            }
        }
    },
    kufurKoruma: {
        enabled: {
            type: Boolean,
            default: false
        }
    },
    reklamKoruma: {
        enabled: {
            type: Boolean,
            default: false
        }
    },
    autoRole: {
        channelId: {
            type: String,
            required: false
        },
        roleId: {
            type: String,
            required: false
        },
        message: {
            embed: {
                author: {
                    name: {
                        type: String,
                        default: '{{user_tag}}'
                    },
                    iconURL: {
                        type: String,
                        default: '{{user_avatar}}'
                    }
                },
                title: {
                    type: String,
                    default: 'OtoRol verildi!'
                },
                description: {
                    type: String,
                    default: 'Sunucumuza hoşgeldin {{user}}, {{role}} rolün verildi.'
                },
                footer: {
                    text: {
                        type: String,
                        default: 'Soft Bot | 2022 ©'
                    },
                    iconURL: {
                        type: String,
                        default: '{{guild_icon}}'
                    }
                },
                color: {
                    type: String,
                    default: '0x00FF00'
                }
            }
        }
    },
    levellingSystem: {
        channelId: {
            type: String,
            required: false,
            default: "0"
        },
        enabled: {
            type: Boolean,
            default: false
        },
        XpPerMessage: {
            type: Number,
            default: 3
        },
        LevelUpMessage: {
            type: String,
            default: "⚡ | {{member}} kişisi seviye atladı! **{{old_level}}** → **{{level}}"
        }
    }
})

module.exports = model('Guilds', guild_schema);