import {
  ConsentState,
  EncodedContent,
  IdentifierKind,
  Message,
  MetadataField,
  PermissionPolicy,
  PermissionUpdateType,
} from '@xmtp/node-bindings'
import { describe, expect, it } from 'vitest'
import {
  createRegisteredClient,
  createUser,
  encodeTextMessage,
  sleep,
} from '@test/helpers'

describe.concurrent('Conversation', () => {
  it('should update conversation name', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])
    const newName = 'foo'
    await conversation.updateGroupName(newName)
    expect(conversation.groupName()).toBe(newName)
    const messages = await conversation.findMessages()
    expect(messages.length).toBe(2)

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)

    const conversation2 = conversations[0].conversation
    expect(conversation2).toBeDefined()
    await conversation2.sync()
    expect(conversation2.id()).toBe(conversation.id())
    expect(conversation2.groupName()).toBe(newName)
    const messages2 = await conversation2.findMessages()
    expect(messages2.length).toBe(2)
  })

  it('should update conversation image URL', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])
    const imageUrl = 'https://foo/bar.jpg'
    await conversation.updateGroupImageUrlSquare(imageUrl)
    expect(conversation.groupImageUrlSquare()).toBe(imageUrl)
    const messages = await conversation.findMessages()
    expect(messages.length).toBe(2)

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)

    const conversation2 = conversations[0].conversation
    expect(conversation2).toBeDefined()
    await conversation2.sync()
    expect(conversation2.id()).toBe(conversation.id())
    expect(conversation2.groupImageUrlSquare()).toBe(imageUrl)
    const messages2 = await conversation2.findMessages()
    expect(messages2.length).toBe(2)
  })

  it('should update conversation description', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])
    const newDescription = 'foo'
    await conversation.updateGroupDescription(newDescription)
    expect(conversation.groupDescription()).toBe(newDescription)
    const messages = await conversation.findMessages()
    expect(messages.length).toBe(2)

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)

    const conversation2 = conversations[0].conversation
    expect(conversation2).toBeDefined()
    await conversation2.sync()
    expect(conversation2.id()).toBe(conversation.id())
    expect(conversation2.groupDescription()).toBe(newDescription)
    const messages2 = await conversation2.findMessages()
    expect(messages2.length).toBe(2)
  })

  it('should add and remove members', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const user3 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const client3 = await createRegisteredClient(user3)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    const members = await conversation.listMembers()

    const memberInboxIds = members.map((member) => member.inboxId)
    expect(memberInboxIds).toContain(client1.inboxId())
    expect(memberInboxIds).toContain(client2.inboxId())
    expect(memberInboxIds).not.toContain(client3.inboxId())

    await conversation.addMembers([
      {
        identifier: user3.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    const members2 = await conversation.listMembers()
    expect(members2.length).toBe(3)

    const memberInboxIds2 = members2.map((member) => member.inboxId)
    expect(memberInboxIds2).toContain(client1.inboxId())
    expect(memberInboxIds2).toContain(client2.inboxId())
    expect(memberInboxIds2).toContain(client3.inboxId())

    await conversation.removeMembers([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    const members3 = await conversation.listMembers()
    expect(members3.length).toBe(2)

    const memberInboxIds3 = members3.map((member) => member.inboxId)
    expect(memberInboxIds3).toContain(client1.inboxId())
    expect(memberInboxIds3).not.toContain(client2.inboxId())
    expect(memberInboxIds3).toContain(client3.inboxId())
  })

  it('should add and remove members by inbox id', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const user3 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const client3 = await createRegisteredClient(user3)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    const members = await conversation.listMembers()
    const memberInboxIds = members.map((member) => member.inboxId)
    expect(memberInboxIds).toContain(client1.inboxId())
    expect(memberInboxIds).toContain(client2.inboxId())
    expect(memberInboxIds).not.toContain(client3.inboxId())

    await conversation.addMembersByInboxId([client3.inboxId()])

    const members2 = await conversation.listMembers()
    expect(members2.length).toBe(3)

    const memberInboxIds2 = members2.map((member) => member.inboxId)
    expect(memberInboxIds2).toContain(client1.inboxId())
    expect(memberInboxIds2).toContain(client2.inboxId())
    expect(memberInboxIds2).toContain(client3.inboxId())

    await conversation.removeMembersByInboxId([client2.inboxId()])

    const members3 = await conversation.listMembers()
    expect(members3.length).toBe(2)

    const memberInboxIds3 = members3.map((member) => member.inboxId)
    expect(memberInboxIds3).toContain(client1.inboxId())
    expect(memberInboxIds3).not.toContain(client2.inboxId())
    expect(memberInboxIds3).toContain(client3.inboxId())
  })

  it('should send and list messages', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    await conversation.send(encodeTextMessage('gm'))

    const messages = await conversation.findMessages()
    expect(messages.length).toBe(2)

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)

    const conversation2 = conversations[0].conversation
    expect(conversation2).toBeDefined()
    await conversation2.sync()
    expect(conversation2.id()).toBe(conversation.id())

    const messages2 = await conversation2.findMessages()
    expect(messages2.length).toBe(2)
  })

  it('should optimistically send and list messages', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    conversation.sendOptimistic(encodeTextMessage('gm'))

    const messages = await conversation.findMessages()
    expect(messages.length).toBe(2)

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)

    const conversation2 = conversations[0].conversation
    expect(conversation2).toBeDefined()

    await conversation2.sync()
    expect(conversation2.id()).toBe(conversation.id())

    const messages2 = await conversation2.findMessages()
    expect(messages2.length).toBe(1)

    await conversation.publishMessages()
    await conversation2.sync()

    const messages4 = await conversation2.findMessages()
    expect(messages4.length).toBe(2)
  })

  it('should stream messages', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    await client2.conversations().sync()
    const conversations = client2.conversations().list()
    expect(conversations.length).toBe(1)
    expect(conversations[0].conversation.id()).toBe(conversation.id())

    const streamedMessages: string[] = []
    const stream = conversations[0].conversation.stream(
      (_, message) => {
        streamedMessages.push(message!.id)
      },
      () => {
        console.log('closed')
      }
    )
    await new Promise((resolve) => setTimeout(resolve, 10000))
    const message1 = await conversation.send(encodeTextMessage('gm'))
    const message2 = await conversation.send(encodeTextMessage('gm2'))

    // Add sleep to allow messages to be processed
    await new Promise((resolve) => setTimeout(resolve, 1000))

    expect(streamedMessages).toContain(message1)
    expect(streamedMessages).toContain(message2)
  })

  it('should add and remove admins', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    expect(conversation.isSuperAdmin(client1.inboxId())).toBe(true)
    expect(conversation.superAdminList().length).toBe(1)
    expect(conversation.superAdminList()).toContain(client1.inboxId())
    expect(conversation.isAdmin(client1.inboxId())).toBe(false)
    expect(conversation.isAdmin(client2.inboxId())).toBe(false)
    expect(conversation.adminList().length).toBe(0)

    await conversation.addAdmin(client2.inboxId())
    expect(conversation.isAdmin(client2.inboxId())).toBe(true)
    expect(conversation.adminList().length).toBe(1)
    expect(conversation.adminList()).toContain(client2.inboxId())

    await conversation.removeAdmin(client2.inboxId())
    expect(conversation.isAdmin(client2.inboxId())).toBe(false)
    expect(conversation.adminList().length).toBe(0)
  })

  it('should add and remove super admins', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    expect(conversation.isSuperAdmin(client1.inboxId())).toBe(true)
    expect(conversation.isSuperAdmin(client2.inboxId())).toBe(false)
    expect(conversation.superAdminList().length).toBe(1)
    expect(conversation.superAdminList()).toContain(client1.inboxId())

    await conversation.addSuperAdmin(client2.inboxId())
    expect(conversation.isSuperAdmin(client2.inboxId())).toBe(true)
    expect(conversation.superAdminList().length).toBe(2)
    expect(conversation.superAdminList()).toContain(client1.inboxId())
    expect(conversation.superAdminList()).toContain(client2.inboxId())

    await conversation.removeSuperAdmin(client2.inboxId())
    expect(conversation.isSuperAdmin(client2.inboxId())).toBe(false)
    expect(conversation.superAdminList().length).toBe(1)
    expect(conversation.superAdminList()).toContain(client1.inboxId())
  })

  it('should manage group consent state', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const user3 = createUser()
    const client1 = await createRegisteredClient(user1)
    const client2 = await createRegisteredClient(user2)
    const client3 = await createRegisteredClient(user3)
    const group = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])
    expect(group).toBeDefined()
    const dmGroup = await client1.conversations().createDm({
      identifier: user3.account.address,
      identifierKind: IdentifierKind.Ethereum,
    })
    expect(dmGroup).toBeDefined()

    await client2.conversations().sync()
    const group2 = client2.conversations().findGroupById(group.id())
    expect(group2).toBeDefined()
    expect(group2!.consentState()).toBe(ConsentState.Unknown)
    await group2!.send(encodeTextMessage('gm!'))
    expect(group2!.consentState()).toBe(ConsentState.Allowed)

    await client3.conversations().sync()
    const dmGroup2 = client3.conversations().findGroupById(dmGroup.id())
    expect(dmGroup2).toBeDefined()
    expect(dmGroup2!.consentState()).toBe(ConsentState.Unknown)
    await dmGroup2!.send(encodeTextMessage('gm!'))
    expect(dmGroup2!.consentState()).toBe(ConsentState.Allowed)
  })

  it('should update group permissions', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    await createRegisteredClient(user2)
    const conversation = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])

    expect(conversation.groupPermissions().policySet()).toEqual({
      addMemberPolicy: 0,
      removeMemberPolicy: 2,
      addAdminPolicy: 3,
      removeAdminPolicy: 3,
      updateGroupNamePolicy: 0,
      updateGroupDescriptionPolicy: 0,
      updateGroupImageUrlSquarePolicy: 0,
      updateMessageDisappearingPolicy: 2,
    })

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.AddMember,
      PermissionPolicy.Admin
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.RemoveMember,
      PermissionPolicy.SuperAdmin
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.AddAdmin,
      PermissionPolicy.Admin
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.RemoveAdmin,
      PermissionPolicy.Admin
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.UpdateMetadata,
      PermissionPolicy.Admin,
      MetadataField.GroupName
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.UpdateMetadata,
      PermissionPolicy.Admin,
      MetadataField.Description
    )

    await conversation.updatePermissionPolicy(
      PermissionUpdateType.UpdateMetadata,
      PermissionPolicy.Admin,
      MetadataField.ImageUrlSquare
    )

    expect(conversation.groupPermissions().policySet()).toEqual({
      addMemberPolicy: 2,
      removeMemberPolicy: 3,
      addAdminPolicy: 2,
      removeAdminPolicy: 2,
      updateGroupNamePolicy: 2,
      updateGroupDescriptionPolicy: 2,
      updateGroupImageUrlSquarePolicy: 2,
      updateMessageDisappearingPolicy: 2,
    })
  })

  it('should get hmac keys', async () => {
    const user1 = createUser()
    const user2 = createUser()
    const client1 = await createRegisteredClient(user1)
    await createRegisteredClient(user2)
    const group = await client1.conversations().createGroup([
      {
        identifier: user2.account.address,
        identifierKind: IdentifierKind.Ethereum,
      },
    ])
    const hmacKeys = group.getHmacKeys()
    expect(hmacKeys).toBeDefined()
    let keys = hmacKeys[group.id()]
    expect(keys.length).toBe(3)
    for (const value of keys) {
      expect(value.key).toBeDefined()
      expect(value.key.length).toBe(42)
      expect(value.epoch).toBeDefined()
      expect(typeof value.epoch).toBe('bigint')
    }
  })
})
