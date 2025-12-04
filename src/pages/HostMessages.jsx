import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const HostMessagesPage = ({ isLoggedIn, userType, hostMessages, formatDate, onBack, user }) => {
  const [activeMessageId, setActiveMessageId] = React.useState(null);
  const [replyText, setReplyText] = React.useState('');

  if (!isLoggedIn || userType !== 'host') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Host messages are available after you login as a host.
        </h2>
        <p className="text-gray-600">
          Please login or switch to your host account to view conversations with guests.
        </p>
      </div>
    );
  }

  const unreadCount = hostMessages.filter((m) => m.status === 'unread').length;

  const active = activeMessageId
    ? hostMessages.find((m) => m.id === activeMessageId)
    : null;

  // List view
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (!active) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 m-0">
                  Messages
                </h1>
                <p className="text-sm text-gray-500">
                  Conversations with your guests across all properties.
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Host Dashboard
            </Button>
          </div>

          {hostMessages.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-gray-500">
                You don&apos;t have any guest messages yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {hostMessages.map((message) => (
                <Card
                  key={message.id}
                  className="cursor-pointer hover:border-blue-500 hover:shadow-sm transition"
                  onClick={() => {
                    setActiveMessageId(message.id);
                    setReplyText('');
                  }}
                >
                  <CardContent className="pt-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(message.guestName)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">
                            {message.propertyName}
                          </p>
                          {message.status === 'unread' && (
                            <Badge variant="destructive">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          From {message.guestName} • {formatDate(message.date)}
                        </p>
                        <p className="mt-2 font-medium text-gray-800">
                          {message.subject}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {message.preview}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button size="sm" variant="outline">
                        View Conversation
                      </Button>
                      {message.status === 'unread' && (
                        <p className="text-xs text-red-500 font-medium">
                          Unread
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {unreadCount > 0 && (
            <p className="mt-4 text-xs text-gray-500">
              You have {unreadCount} unread message
              {unreadCount > 1 ? 's' : ''}.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Conversation view
  const messages = active.messages || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveMessageId(null);
              setReplyText('');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to messages
          </Button>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {active.propertyName}
            </p>
            <p className="text-xs text-gray-500">
              Guest: {active.guestName} • {formatDate(active.date)}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Conversation with {active.guestName}
            </CardTitle>
            <CardDescription>
              Messages for {active.propertyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
              {messages.map((msg) => {
                const isHost = msg.sender === 'host';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isHost ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isHost && (
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(active.guestName)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        isHost
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="mt-1 text-[11px] opacity-70 text-right">
                        {formatDate(msg.timestamp)}
                      </p>
                    </div>
                    {isHost && (
                      <div className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(user?.name || 'Host')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="host-reply">Your reply</Label>
              <textarea
                id="host-reply"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your reply to the guest..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyText('');
                }}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!replyText.trim()) {
                    alert('Please enter a reply before sending.');
                    return;
                  }
                  // Here is where you will integrate socket.io:
                  // socket.emit('message:send', {
                  //   threadId: active.id,
                  //   text: replyText,
                  //   propertyId: active.property_id,
                  //   bookingId: active.booking_id,
                  //   recipientId: active.sender_id,
                  // });
                  alert('Reply sent (demo only – wire to socket.io/backend).');
                  setReplyText('');
                }}
              >
                Send Reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostMessagesPage;
